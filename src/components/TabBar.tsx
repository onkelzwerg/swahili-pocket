import { Link } from "@tanstack/react-router";
import { Home, BookOpen, Layers, Library, CloudOff, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { T } from "@/config/translations";

// Fünf Tabs (W3.6). Dialoge und Ngeli sind in die Bibliothek gewandert —
// als Routen bleiben sie bestehen, sie haben nur keinen eigenen Tab mehr.
const tabs = [
  { to: "/", label: T.nav.home, icon: Home },
  { to: "/review", label: T.nav.review, icon: Layers },
  { to: "/lexicon", label: T.nav.lexicon, icon: BookOpen },
  { to: "/library", label: T.nav.library, icon: Library },
  { to: "/account", label: T.nav.account, icon: User },
] as const;

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// `navigator.onLine` ist browser-only. Node und Workers definieren zwar ein
// globales `navigator`, aber ohne `onLine` — ein `typeof navigator`-Check läuft
// dort also ins Leere und liefert `undefined` (= "offline"). Der Server rendert
// dann das Offline-Banner, der Browser nicht: Hydration-Mismatch auf *jeder*
// Route, weil die TabBar im Root-Layout hängt.
// useSyncExternalStore löst genau das: React nimmt für SSR *und* den
// Hydration-Render den Server-Snapshot und wechselt erst danach auf den echten
// Wert. Das Banner erscheint also frühestens nach der Hydration.
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine !== false,
    () => true,
  );
}

export function TabBar() {
  const online = useOnlineStatus();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      {!online && (
        <div
          role="status"
          className="flex items-center justify-center gap-1.5 bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground"
        >
          <CloudOff className="h-3 w-3" />
          <span>{T.nav.offlineBanner}</span>
        </div>
      )}
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
