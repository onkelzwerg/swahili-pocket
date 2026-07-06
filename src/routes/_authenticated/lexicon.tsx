import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PoolTab } from "@/components/lexicon/PoolTab";
import { CardsTab } from "@/components/lexicon/CardsTab";
import { APP_CONFIG } from "@/config/app.config";
import { T } from "@/config/translations";

export const Route = createFileRoute("/_authenticated/lexicon")({
  head: () => ({
    meta: [
      { title: `${T.lexicon.metaTitleSuffix} — ${APP_CONFIG.appName}` },
      {
        name: "description",
        content: T.lexicon.metaDescription,
      },
    ],
  }),
  component: LexiconPage,
});

function LexiconPage() {
  const [tab, setTab] = useState<"pool" | "cards">("pool");

  return (
    <div className="px-5 pt-8">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{T.lexicon.eyebrow}</p>
          <h1 className="font-display text-3xl font-bold">{T.lexicon.title}</h1>
        </div>
        <Link
          to="/lexicon/new"
          className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" /> {T.lexicon.newCta}
        </Link>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
        <button
          onClick={() => setTab("pool")}
          className={`rounded-full py-2 text-sm font-semibold ${
            tab === "pool" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          {T.lexicon.tabs.pool}
        </button>
        <button
          onClick={() => setTab("cards")}
          className={`rounded-full py-2 text-sm font-semibold ${
            tab === "cards" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          {T.lexicon.tabs.cards}
        </button>
      </div>

      {tab === "pool" ? <PoolTab /> : <CardsTab />}
    </div>
  );
}
