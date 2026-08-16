import { SpeakButton } from "@/components/SpeakButton";
import { T } from "@/config/translations";
import { monosyllabicVerbsInfo } from "@/lib/seed";
import {
  moodInfo,
  negationInfo,
  negationRows,
  objectInfixInfo,
  personPrefixes,
  relativeInfo,
  verbStructure,
  verbTenses,
  type VerbExample,
} from "@/lib/verb-grammar";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

/** Beispielzeile mit Vorlesen — dasselbe Muster wie in der Ngeli-Referenz. */
function ExampleList({ items }: { items: VerbExample[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((ex, i) => (
        <li key={i} className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{ex.sw}</p>
            <p className="text-xs text-muted-foreground">{ex.de}</p>
          </div>
          <SpeakButton text={ex.sw} size="sm" />
        </li>
      ))}
    </ul>
  );
}

function Card({
  id,
  title,
  tag,
  intro,
  children,
}: {
  id?: string;
  title: string;
  tag?: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      id={id}
      className="scroll-mt-4 overflow-hidden rounded-2xl border border-border bg-card transition-shadow"
    >
      <div className="bg-gradient-to-r from-ochre/30 to-primary/20 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {tag && (
            <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-[11px] font-bold">
              {tag}
            </span>
          )}
        </div>
        {intro && <p className="mt-1 text-sm text-muted-foreground">{intro}</p>}
      </div>
      {children}
    </li>
  );
}

export function VerbReference() {
  return (
    <ul className="flex flex-col gap-3">
      {/* Bauplan */}
      <Card id="structure" title={T.verbs.structure.title} intro={T.verbs.structure.intro}>
        <div className="border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {verbStructure.slots.map((s) => (
              <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
            {verbStructure.example.parts.map((p, i) => (
              <span key={i} className="font-display text-lg font-bold">
                {p}
                {i < verbStructure.example.parts.length - 1 && (
                  <span className="px-1 text-muted-foreground">+</span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-1 text-sm">
            <strong>{verbStructure.example.sw}</strong> — {verbStructure.example.de}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{verbStructure.note}</p>
        </div>
        <div className="px-4 py-3">
          <Label>{T.verbs.structure.persons}</Label>
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr>
                  <td />
                  {[
                    T.verbs.structure.subject,
                    T.verbs.structure.negative,
                    T.verbs.structure.object,
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-1.5 pb-1 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personPrefixes.map((p) => (
                  <tr key={p.label} className="border-t border-border/60">
                    <th
                      scope="row"
                      className="py-1.5 pr-2 text-left text-xs font-normal text-muted-foreground"
                    >
                      {p.label}
                    </th>
                    <td className="px-1.5 py-1.5 font-medium">{p.subject}</td>
                    <td className="px-1.5 py-1.5 font-medium">{p.subjectNegative}</td>
                    <td className="px-1.5 py-1.5 font-medium">{p.object}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{T.verbs.structure.classHint}</p>
        </div>
      </Card>

      {/* Zeitformen — je eine Karte, weil der Trainer genau hierher springt. */}
      {verbTenses.map((t) => (
        <Card
          key={t.id}
          id={`tense-${t.id}`}
          title={`${t.marker} ${t.name}`}
          tag={t.pattern}
          intro={t.meaning}
        >
          <div className="border-b border-border px-4 py-3">
            <Label>{T.verbs.examples}</Label>
            <ExampleList items={t.examples} />
          </div>
          {t.negative && (
            <div className="border-b border-border px-4 py-3">
              <Label>{T.verbs.negated}</Label>
              <p className="text-xs text-muted-foreground">{t.negative.pattern}</p>
              <div className="mt-2">
                <ExampleList items={[t.negative.example]} />
              </div>
            </div>
          )}
          {t.note && <p className="px-4 py-3 text-xs text-muted-foreground">{t.note}</p>}
        </Card>
      ))}

      {/* Verneinung */}
      <Card id="negation" title={T.verbs.negation.title} intro={T.verbs.negation.intro}>
        {/* Bewusst Zeilen statt Tabelle: Drei Spalten plus Regeltext passen auf
            375 px nicht nebeneinander — die verneinte Form wäre abgeschnitten,
            und genau auf sie zeigt der Link aus dem Trainer. */}
        <div className="border-b border-border px-4 py-3">
          {negationRows.map((r) => (
            <div
              key={r.tenseId}
              id={`neg-${r.tenseId}`}
              className="scroll-mt-4 border-t border-border/60 py-2 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="text-xs text-muted-foreground">{r.tense}</span>
                <span className="text-sm font-medium">
                  {r.affirmative.sw} <span className="text-muted-foreground">→</span>{" "}
                  <span className="font-semibold text-destructive">{r.negative.sw}</span>
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{r.rule}</p>
            </div>
          ))}
          <p className="mt-3 text-xs text-muted-foreground">{negationInfo.rule}</p>
        </div>
        <div className="border-b border-border px-4 py-3">
          <Label>{T.verbs.negation.persons}</Label>
          <ExampleList items={negationInfo.persons} />
        </div>
        <p className="px-4 py-3 text-xs text-muted-foreground">{negationInfo.vowelNote}</p>
      </Card>

      {/* Imperativ & Konjunktiv */}
      <Card
        id={moodInfo.imperative.id}
        title={T.verbs.imperative.title}
        intro={moodInfo.imperative.rule}
      >
        <div className="border-b border-border px-4 py-3">
          <ExampleList items={moodInfo.imperative.examples} />
        </div>
        <div className="border-b border-border px-4 py-3">
          <Label>{T.verbs.imperative.irregular}</Label>
          <ExampleList items={moodInfo.imperative.irregular} />
        </div>
        <p className="px-4 py-3 text-xs text-muted-foreground">{moodInfo.imperative.note}</p>
      </Card>

      <Card
        id={moodInfo.subjunctive.id}
        title={T.verbs.subjunctive.title}
        intro={moodInfo.subjunctive.rule}
      >
        <div className="border-b border-border px-4 py-3">
          <ExampleList items={moodInfo.subjunctive.examples} />
        </div>
        <div className="border-b border-border px-4 py-3">
          <Label>{T.verbs.negated}</Label>
          <ExampleList items={moodInfo.subjunctive.negative} />
        </div>
        <p className="px-4 py-3 text-xs text-muted-foreground">{moodInfo.subjunctive.note}</p>
      </Card>

      {/* Objektinfix */}
      <Card id={objectInfixInfo.id} title={T.verbs.object.title} intro={objectInfixInfo.rule}>
        <div className="border-b border-border px-4 py-3">
          <ExampleList items={objectInfixInfo.examples} />
        </div>
        <p className="px-4 py-3 text-xs text-muted-foreground">{objectInfixInfo.note}</p>
      </Card>

      {/* Relativformen */}
      <Card id={relativeInfo.id} title={T.verbs.relative.title} intro={relativeInfo.rule}>
        <div className="border-b border-border px-4 py-3">
          <ExampleList items={relativeInfo.examples} />
        </div>
        <p className="px-4 py-3 text-xs text-muted-foreground">{relativeInfo.note}</p>
      </Card>

      {/* Einsilbige Verben — von der Ngeli-Seite hierher gezogen, wo sie hingehört. */}
      <Card
        id="monosyllabic"
        title={T.reference.monosyllabic.title}
        tag={T.reference.monosyllabic.tag}
        intro={T.reference.monosyllabic.intro}
      >
        <div className="border-b border-border px-4 py-3">
          <Label>{T.reference.monosyllabic.mainVerbs}</Label>
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
          <ExampleList items={monosyllabicVerbsInfo.withKu} />
        </div>
        <div className="px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-destructive">
            {T.reference.monosyllabic.withoutKu}
          </div>
          <ExampleList items={monosyllabicVerbsInfo.withoutKu} />
          <p className="mt-3 text-xs text-muted-foreground">{T.reference.monosyllabic.rule}</p>
        </div>
      </Card>
    </ul>
  );
}
