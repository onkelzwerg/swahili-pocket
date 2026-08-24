import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { TabBar } from "@/components/TabBar";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";
import { startRouteWarmup } from "@/lib/route-warmup";

const NATIVE_LANG_CODES: Record<string, string> = { Deutsch: "de", English: "en" };
const HTML_LANG = NATIVE_LANG_CODES[APP_CONFIG.nativeLanguage] ?? "de";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{T.root.notFound.headline}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{T.root.notFound.body}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          {T.root.notFound.cta}
        </Link>
      </div>
    </div>
  );
}

const CHUNK_ERROR_RE =
  /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|ChunkLoadError|error loading dynamically/i;

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { name?: string; message?: string };
  if (e.name === "ChunkLoadError") return true;
  return typeof e.message === "string" && CHUNK_ERROR_RE.test(e.message);
}

function tryHardReload(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "lv:lastChunkReload";
    const last = Number(sessionStorage.getItem(key) || "0");
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // sessionStorage might be unavailable — still attempt reload once.
  }
  window.location.reload();
  return true;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const isChunk = isChunkLoadError(error);

  useEffect(() => {
    if (isChunk) tryHardReload();
  }, [isChunk]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{T.root.error.headline}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isChunk ? T.root.error.chunkBody : error.message}
        </p>
        <button
          onClick={() => {
            if (isChunk) {
              if (typeof window !== "undefined") window.location.reload();
              return;
            }
            router.invalidate();
            reset();
          }}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          {isChunk ? T.root.error.chunkCta : T.common.retry}
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: APP_CONFIG.primaryColor },
      { title: T.root.meta.title },
      { name: "description", content: T.root.meta.description },
      { name: "author", content: APP_CONFIG.appName },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: APP_CONFIG.targetLanguage },
      { property: "og:title", content: T.root.meta.title },
      { property: "og:description", content: T.root.meta.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: T.root.meta.title },
      { name: "twitter:description", content: T.root.meta.description },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      // Schriften kommen aus public/fonts/ (@font-face in styles.css), nicht
      // von fonts.googleapis.com: kein Fremdaufruf beim Seitenaufruf, und die
      // Display-Schrift steht auch offline. Bitte keine CDN-Links zurückholen.
      // Die beiden Familien vorladen — sie stehen im ersten sichtbaren Text.
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/plus-jakarta-sans-latin.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/fraunces-latin.woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang={HTML_LANG}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ChunkReloadGuard() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (isChunkLoadError(e.error) || (e.message && CHUNK_ERROR_RE.test(e.message))) {
        tryHardReload();
      }
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isChunkLoadError(e.reason)) tryHardReload();
    };
    const onPreload = () => tryHardReload();
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("vite:preloadError", onPreload as EventListener);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("vite:preloadError", onPreload as EventListener);
    };
  }, []);
  return null;
}

/**
 * Holt die Route-Bündel im Leerlauf in den Cache, damit auch nie besuchte
 * Bereiche offline erreichbar sind (Begründung in lib/route-warmup.ts).
 */
function RouteWarmup() {
  const router = useRouter();
  useEffect(() => startRouteWarmup(router), [router]);
  return null;
}

function PwaInit() {
  useEffect(() => {
    void import("@/lib/pwa").then((m) => m.initPwa());
    // Browser um persistenten Speicher bitten — die Lerndaten leben in IndexedDB.
    void import("@/lib/backup").then((m) => m.requestPersistentStorage());
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ChunkReloadGuard />
      <RouteWarmup />
      <PwaInit />
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
        <main className="flex-1 pb-24">
          <Outlet />
        </main>
        <TabBar />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
