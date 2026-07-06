import { toast } from "sonner";

// Registriert den Service Worker nur in echten Produktions-Builds auf einer
// echten Host-Domain. Im Lovable-Editor (Preview-Iframe, *.lovable.app /
// *.lovableproject.com / *-preview--*) wird stattdessen aktiv aufgeräumt,
// damit der Editor nie eine gestale SW-Shell serviert.

function isPreviewHost(host: string): boolean {
  return (
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovable.app") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function unregisterAndPurge() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
    if ("caches" in self) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
    }
  } catch {
    /* ignore */
  }
}

function listenForUpdates(reg: ServiceWorkerRegistration) {
  const promptUpdate = (waiting: ServiceWorker) => {
    toast("Neue Version verfügbar", {
      description: "Tippe zum Neuladen.",
      action: {
        label: "Neu laden",
        onClick: () => {
          waiting.postMessage({ type: "SKIP_WAITING" });
        },
      },
      duration: Infinity,
    });
  };

  if (reg.waiting) promptUpdate(reg.waiting);

  reg.addEventListener("updatefound", () => {
    const nw = reg.installing;
    if (!nw) return;
    nw.addEventListener("statechange", () => {
      if (nw.state === "installed" && navigator.serviceWorker.controller) {
        promptUpdate(nw);
      }
    });
  });

  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}

export function initPwa() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const host = window.location.hostname;
  const preview = isPreviewHost(host) || inIframe();
  const isProd = import.meta.env.PROD;

  if (preview || !isProd) {
    void unregisterAndPurge();
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => listenForUpdates(reg))
      .catch((err) => console.warn("[pwa] SW registration failed", err));
  });
}
