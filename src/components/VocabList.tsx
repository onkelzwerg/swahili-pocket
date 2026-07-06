import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SpeakButton } from "@/components/SpeakButton";
import { isMonosyllabicVerb } from "@/lib/seed";
import { T } from "@/config/translations";
import type { VocabEntry } from "@/lib/types";

export function VocabListPage({
  title,
  subtitle,
  items,
  loading,
  emptyTitle,
  emptyHint,
  meta,
}: {
  title: string;
  subtitle: string;
  items: VocabEntry[];
  loading: boolean;
  emptyTitle: string;
  emptyHint?: React.ReactNode;
  meta?: (e: VocabEntry) => React.ReactNode;
}) {
  return (
    <div className="px-5 pt-8 pb-12">
      <header className="mb-5 flex items-center gap-3">
        <Link
          to="/"
          aria-label={T.vocabList.backAria}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {subtitle}
          </p>
          <h1 className="font-display text-2xl font-bold leading-tight">{title}</h1>
        </div>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {T.common.loading}
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{emptyTitle}</p>
          {emptyHint && <div className="mt-2">{emptyHint}</div>}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((e) => (
            <li key={e.id} className="rounded-2xl border border-border bg-card p-3.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-semibold">{e.swahili}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {T.vocabList.boxBadge(e.box)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{e.german}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {e.partOfSpeech}
                    </span>
                    {e.nounClass && (
                      <span className="rounded-full bg-ochre/30 px-2 py-0.5 text-[11px] font-medium text-ochre-foreground">
                        {e.nounClass}
                      </span>
                    )}
                    {e.partOfSpeech === "verb" && isMonosyllabicVerb(e.swahili) && (
                      <span className="rounded-full bg-forest/20 px-2 py-0.5 text-[11px] font-semibold text-forest">
                        {T.vocabList.monosyllabic}
                      </span>
                    )}
                  </div>
                  {meta && <div className="mt-2 text-[11px] text-muted-foreground">{meta(e)}</div>}
                </div>
                {!e.isPrivate && <SpeakButton text={e.swahili} size="sm" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
