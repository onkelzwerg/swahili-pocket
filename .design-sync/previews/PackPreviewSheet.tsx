import { PackPreviewSheet } from "tanstack_start_ts";

// Opens as a full-screen BottomSheet, like PoolPickerSheet — see that preview
// (and NOTES.md) for why the `translateZ(0)` wrapper is needed.
//
// The sheet loads its words from `/vocab-packs/<id>.json`, which the preview
// harness does not serve. Unstubbed, the card would show nothing but the
// "lässt sich nicht laden"-Hinweis — i.e. none of what this component is for.
// So one fetch stub answers that single path and delegates everything else to
// the real fetch (PoolTab's `/vocab-pool.json` must keep working).
const realFetch = globalThis.fetch;
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url.includes("/vocab-packs/")) {
    return Promise.resolve(
      new Response(JSON.stringify({ ...pack, entries }), {
        headers: { "content-type": "application/json" },
      }),
    );
  }
  return realFetch(input, init);
}) as typeof fetch;

const pack = {
  id: "arbeit-und-karriere",
  title: "Arbeit & Bewerbung",
  emoji: "💼",
  description: "Bewerbung, Projekte, Strategie — Wortschatz für „Vorstellungsgespräch“.",
  wordCount: 4,
};

const entries = [
  {
    swahili: "bajeti",
    german: "Budget",
    partOfSpeech: "noun",
    nounClass: "N",
    examples: [{ sw: "Bajeti yetu ni ndogo.", de: "Unser Budget ist klein." }],
  },
  {
    swahili: "fursa",
    german: "Gelegenheit / Chance",
    partOfSpeech: "noun",
    nounClass: "N",
    examples: [{ sw: "Hii ni fursa nzuri kwangu.", de: "Das ist eine gute Chance für mich." }],
  },
  {
    swahili: "jukumu",
    german: "Aufgabe / Verantwortung",
    partOfSpeech: "noun",
    nounClass: "Ji-Ma",
    examples: [{ sw: "Hili ni jukumu langu.", de: "Das ist meine Aufgabe." }],
  },
  {
    swahili: "kubuni",
    german: "entwerfen / gestalten",
    partOfSpeech: "verb",
    examples: [{ sw: "Tunabuni mpango mpya.", de: "Wir entwerfen einen neuen Plan." }],
  },
];

export const Open = () => (
  <div className="relative h-[620px] w-full overflow-hidden" style={{ transform: "translateZ(0)" }}>
    <PackPreviewSheet
      pack={pack}
      active={false}
      busy={false}
      onToggle={() => {}}
      onClose={() => {}}
    />
  </div>
);
