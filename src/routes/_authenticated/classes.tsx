import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reference } from "@/components/classes/Reference";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/classes")({
  head: () => ({
    meta: [
      { title: T.classes.metaTitle },
      { name: "description", content: T.classes.metaDescription },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  return (
    <div className="px-5 pt-8">
      <header className="mb-4">
        <p className="text-sm font-medium text-muted-foreground">{T.classes.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold">{T.classes.title}</h1>
      </header>
      {/* Von der Übersicht direkt ins Üben — Regeln lesen ist nicht Können. */}
      <Link
        to="/trainer"
        className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 active:scale-[0.98]"
      >
        <span className="text-2xl">🏋️</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{T.trainer.homeCta}</p>
          <p className="text-xs text-muted-foreground">{T.trainer.tabs.ngeli}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>
      <Reference />
    </div>
  );
}
