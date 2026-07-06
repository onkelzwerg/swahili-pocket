import { Link } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  Layers,
  MessagesSquare,
  GraduationCap,
  CloudOff,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { T } from "@/config/translations";

const tabs = [
  { to: "/", label: T.nav.home, icon: Home },
  { to: "/lexicon", label: T.nav.lexicon, icon: BookOpen },
  { to: "/review", label: T.nav.review, icon: Layers },
  { to: "/dialogues", label: T.nav.dialogues, icon: MessagesSquare },
  { to: "/classes", label: T.nav.classes, icon: GraduationCap },
  { to: "/account", label: T.nav.account, icon: User },
] as const;

function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
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
