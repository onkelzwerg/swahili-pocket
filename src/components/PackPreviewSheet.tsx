import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadPack, type PackMeta } from "@/lib/packs";
import type { PoolEntry } from "@/lib/pool";
import { BottomSheet } from "@/components/BottomSheet";
import { T } from "@/config/translations";

/**
 * Vorschau auf ein Themenpaket: welche Wörter kommen dazu, bevor man es
 * einschaltet.
 *
 * Ein Paket wird als Ganzes zugeschaltet — deshalb ist die Liste hier nur zum
 * Lesen, anders als im PoolPickerSheet, wo man einzelne Vokabeln abwählt. Die
 * Karten sehen trotzdem gleich aus: es ist derselbe Wortschatz in derselben
 * Rolle, nur eine Ebene früher.
 */
export function PackPreviewSheet({
  pack,
  active,
  busy,
  onToggle,
  onClose,
}: {
  /** Das anzuzeigende Paket — `null` schließt das Sheet. */
  pack: PackMeta | null;
  active: boolean;
  busy: boolean;
  onToggle: (id: string, on: boolean) => void;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<PoolEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  const id = pack?.id;

  useEffect(() => {
    if (!id) return;
    let stale = false;
    setEntries(null);
    setFailed(false);
    void loadPack(id).then((p) => {
      if (stale) return;
      if (p) setEntries(p.entries);
      else setFailed(true);
    });
    return () => {
      stale = true;
    };
  }, [id]);

  const footer = pack ? (
    <>
      <button
        onClick={onClose}
        className="rounded-full border border-border bg-card py-3 text-sm font-semibold"
      >
        {T.common.close}
      </button>
      <button
        disabled={busy}
        onClick={() => onToggle(pack.id, !active)}
        className={`inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:opacity-50 ${
          active ? "border border-border bg-card" : "bg-primary text-primary-foreground"
        }`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {active ? T.packs.turnOff : T.packs.turnOn}
      </button>
    </>
  ) : undefined;

  return (
    <BottomSheet
      open={pack !== null}
      onClose={onClose}
      eyebrow={T.packs.previewEyebrow}
      title={pack ? `${pack.emoji} ${pack.title}` : ""}
      footer={footer}
    >
      {pack && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{pack.description}</p>

          {failed ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              {T.packs.previewFailed}
            </p>
          ) : entries === null ? (
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {T.common.loading}
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {T.packs.previewHint(entries.length, active)}
              </p>
              <ul className="flex flex-col gap-2">
                {entries.map((e) => (
                  <li key={e.swahili} className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-base font-semibold">{e.swahili}</h3>
                        <p className="text-xs text-muted-foreground">{e.german}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                          {e.partOfSpeech}
                        </span>
                        {e.nounClass && (
                          <span className="rounded-full bg-ochre/30 px-2 py-0.5 text-[10px] font-semibold text-ochre-foreground">
                            {e.nounClass}
                          </span>
                        )}
                      </div>
                    </div>
                    {e.examples[0] && (
                      <p className="mt-2 border-t border-border/60 pt-2 text-xs">
                        <span className="font-medium">{e.examples[0].sw}</span>
                        <span className="text-muted-foreground"> — {e.examples[0].de}</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
