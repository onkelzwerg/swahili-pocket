import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { VerbReference } from "@/components/verbs/VerbReference";
import { useHashTarget } from "@/hooks/use-hash-target";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/verbs")({
  head: () => ({
    meta: [{ title: T.verbs.metaTitle }, { name: "description", content: T.verbs.metaDescription }],
  }),
  component: VerbsPage,
});

/**
 * Verbgrammatik zum Nachlesen (Gegenstück zu /classes).
 *
 * Der Trainer verlinkt aus jeder Aufgabe hierher — jede Zeitform und jede
 * Verneinungszeile hat einen eigenen Anker, damit man auf der Erklärung landet
 * und nicht auf einer Seite, auf der sie irgendwo steht.
 */
function VerbsPage() {
  useHashTarget();

  return (
    <div className="px-5 pt-8 pb-[calc(env(safe-area-inset-bottom)+5.5rem)]">
      <header className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">{T.verbs.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.verbs.title}</h1>
      </header>
      <Link
        to="/trainer"
        search={{ tab: "verb" }}
        className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 active:scale-[0.98]"
      >
        <span className="text-2xl">🏋️</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{T.trainer.homeCta}</p>
          <p className="text-xs text-muted-foreground">{T.trainer.tabs.verb}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
      <VerbReference />
    </div>
  );
}
