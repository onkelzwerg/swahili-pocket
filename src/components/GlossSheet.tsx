import { useState } from "react";
import { Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { addPoolEntryToCards, addPrivateCard, findInPool } from "@/lib/pool";
import { speak, createUnlockedAudio } from "@/lib/tts";
import { BottomSheet } from "@/components/BottomSheet";
import { T } from "@/config/translations";

/**
 * Ein Glossareintrag, wie ihn die Pipelines schreiben. Geschichten und Dialoge
 * benutzen dieselbe Form (`StoryGloss`, `DialogueGloss`) — deshalb steht hier
 * die Struktur und nicht der Import einer der beiden Seiten.
 */
export interface Gloss {
  lemma: string;
  de: string;
  proper?: boolean;
  structure?: boolean;
}

/**
 * Wort-Nachschlag (W3.3, seit W4.4 auch in Dialogen).
 *
 * Übernehmen geht über den Pool, wenn es das Lemma dort gibt; sonst als eigene
 * Karte — beim Lesen begegnen einem Wörter, die der kuratierte Pool nicht
 * führt, und daran soll der Lernfluss nicht enden.
 */
export function GlossSheet({
  token,
  gloss,
  isNew = false,
  inCards,
  onClose,
  onAdded,
}: {
  /** Das angetippte Token (Schreibweise im Text), null = geschlossen. */
  token: string | null;
  gloss: Gloss | null;
  /** Führt der Text dieses Wort bewusst neu ein? Nur Geschichten kennen das. */
  isNew?: boolean;
  inCards: boolean;
  onClose: () => void;
  onAdded: (lemma: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!gloss) return;
    setBusy(true);
    try {
      const [fromPool] = await findInPool([gloss.lemma]);
      const result = fromPool
        ? await addPoolEntryToCards(fromPool)
        : await addPrivateCard({ swahili: gloss.lemma, german: gloss.de });
      if (result.added) {
        onAdded(gloss.lemma);
        toast.success(T.gloss.added);
      }
      onClose();
    } finally {
      setBusy(false);
    }
  }

  // Eigennamen und grammatische Formen sind keine Karteikarten.
  const addable = !!gloss && !gloss.proper && !gloss.structure && !inCards;

  return (
    <BottomSheet open={!!token && !!gloss} onClose={onClose} title={token ?? ""}>
      {gloss && (
        <div className="space-y-4">
          <div>
            <p className="font-display text-2xl font-bold">{gloss.de}</p>
            {gloss.proper ? (
              <p className="mt-1 text-xs text-muted-foreground">{T.gloss.properName}</p>
            ) : (
              gloss.lemma !== token && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {T.gloss.baseForm(gloss.lemma)}
                </p>
              )
            )}
            {isNew && (
              <p className="mt-1 text-xs font-medium text-ochre-foreground">
                {T.stories.reader.newWordHint}
              </p>
            )}
          </div>

          {gloss.structure && (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              {T.gloss.structure}
            </p>
          )}

          <button
            type="button"
            aria-label={T.gloss.listenAria}
            onClick={() => token && void speak(token, createUnlockedAudio())}
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"
          >
            <Play className="h-3.5 w-3.5" /> {token}
          </button>

          {addable ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void add()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> {T.gloss.addCard}
            </button>
          ) : (
            !gloss.proper &&
            !gloss.structure && (
              <p className="text-xs font-medium text-muted-foreground">{T.gloss.inCards}</p>
            )
          )}
        </div>
      )}
    </BottomSheet>
  );
}
