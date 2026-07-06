import { nounClasses, monosyllabicVerbsInfo } from "@/lib/seed";
import { SpeakButton } from "@/components/SpeakButton";
import { T } from "@/config/translations";

export function Reference() {
  return (
    <ul className="flex flex-col gap-3">
      {nounClasses.map((c) => (
        <li key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="bg-gradient-to-r from-ochre/30 to-primary/20 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{c.name}</h2>
              <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-bold">{c.id}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.meaning}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-b border-border px-4 py-3 text-sm">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {T.reference.singular}
              </div>
              <div className="font-display text-lg font-semibold">{c.singular}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {T.reference.plural}
              </div>
              <div className="font-display text-lg font-semibold">{c.plural}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {T.reference.subjectPrefix}
              </div>
              <div className="text-sm font-medium">
                {c.subjectPrefix.sg} / {c.subjectPrefix.pl}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {T.reference.objectPrefix}
              </div>
              <div className="text-sm font-medium">
                {c.objectPrefix.sg} / {c.objectPrefix.pl}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {T.reference.genitive}
              </div>
              <div className="text-sm font-medium">
                {c.genitive.sg} / {c.genitive.pl}
              </div>
            </div>
          </div>
          <div className="border-b border-border px-4 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {T.reference.demonstratives}
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <span className="text-xs text-muted-foreground">{T.reference.near}</span>
              <span className="font-medium">
                {c.demonstratives.near.sg} / {c.demonstratives.near.pl}
              </span>
              <span className="text-xs text-muted-foreground">{T.reference.far}</span>
              <span className="font-medium">
                {c.demonstratives.far.sg} / {c.demonstratives.far.pl}
              </span>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {T.reference.examples}
            </div>
            <ul className="flex flex-col gap-2">
              {c.examples.map((ex, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{ex.sw}</p>
                    <p className="text-xs text-muted-foreground">{ex.de}</p>
                  </div>
                  <SpeakButton text={ex.sw} size="sm" />
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}

      <li className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-gradient-to-r from-forest/30 to-ochre/20 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">{T.reference.monosyllabic.title}</h2>
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-bold">
              {T.reference.monosyllabic.tag}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Verben mit einsilbigem Stamm behalten in den meisten Zeiten das <strong>ku-</strong> als
            Betonungsträger.
          </p>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {T.reference.monosyllabic.mainVerbs}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {monosyllabicVerbsInfo.verbs.map((v) => (
              <span key={v} className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                {v}
              </span>
            ))}
          </div>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-forest">
            {T.reference.monosyllabic.withKu}
          </div>
          <ul className="flex flex-col gap-2">
            {monosyllabicVerbsInfo.withKu.map((ex, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{ex.sw}</p>
                  <p className="text-xs text-muted-foreground">{ex.de}</p>
                </div>
                <SpeakButton text={ex.sw} size="sm" />
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-destructive">
            {T.reference.monosyllabic.withoutKu}
          </div>
          <ul className="flex flex-col gap-2">
            {monosyllabicVerbsInfo.withoutKu.map((ex, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{ex.sw}</p>
                  <p className="text-xs text-muted-foreground">{ex.de}</p>
                </div>
                <SpeakButton text={ex.sw} size="sm" />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Faustregel: <strong>ku-</strong> fällt im Imperativ Sg., im Habitual (<em>hu-</em>) und
            im Negativ-Präsens weg — sonst bleibt es erhalten.
          </p>
        </div>
      </li>
    </ul>
  );
}
