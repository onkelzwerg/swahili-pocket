import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown } from "lucide-react";
import { nounClasses } from "@/lib/seed";
import { SpeakButton } from "@/components/SpeakButton";
import { T } from "@/config/translations";
import { cn } from "@/lib/utils";
import { classAnchor } from "@/lib/grammar-anchors";
import type { NounClassInfo } from "@/lib/types";

/**
 * Eine Zeile der Konkordanztafel. Spalten sind die Konkordanzsätze der Klasse
 * (Singular/Plural, bei den Ortsklassen Pa-/Ku-/Mu-).
 */
function ConcordGrid({
  columns,
  rows,
}: {
  columns: string[];
  rows: { label: string; cells: string[] }[];
}) {
  // Zeilen, die in keiner Spalte eine Form haben, sagen nichts — sie fliegen
  // raus, statt eine Reihe Gedankenstriche zu zeigen.
  const visible = rows.filter((r) => r.cells.some(Boolean));
  if (visible.length === 0) return null;

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr>
            <td />
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="px-1.5 pb-1 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.label} className="border-t border-border/60">
              <th
                scope="row"
                className="py-1.5 pr-2 text-left text-xs font-normal text-muted-foreground"
              >
                {r.label}
              </th>
              {r.cells.map((cell, i) => (
                <td
                  key={i}
                  className={cn("px-1.5 py-1.5 font-medium", !cell && "text-muted-foreground/50")}
                >
                  {cell || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Aufklappbarer Abschnitt — hält die Karte kurz, ohne Inhalte zu verstecken. */
function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-b border-border px-4 py-3">
      <summary
        id={id}
        className="flex scroll-mt-4 cursor-pointer list-none items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground [&::-webkit-details-marker]:hidden"
      >
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function ClassCard({ c }: { c: NounClassInfo }) {
  const columns = c.concords.map((s) => s.label);

  return (
    <li
      id={classAnchor(c.id)}
      className="scroll-mt-4 overflow-hidden rounded-2xl border border-border bg-card"
    >
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
      </div>

      <div id={classAnchor(c.id, "base")} className="scroll-mt-4 border-b border-border px-4 py-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {T.reference.base.title}
        </div>
        <ConcordGrid
          columns={columns}
          rows={[
            { label: T.reference.base.subject, cells: c.concords.map((s) => s.subject) },
            {
              label: T.reference.base.subjectNegative,
              cells: c.concords.map((s) => s.subjectNegative),
            },
            { label: T.reference.base.genitive, cells: c.concords.map((s) => s.genitive) },
            { label: T.reference.base.object, cells: c.concords.map((s) => s.object) },
            { label: T.reference.base.relative, cells: c.concords.map((s) => s.relative) },
          ]}
        />
      </div>

      {c.personal && (
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {T.reference.personal.title}
          </div>
          <ConcordGrid
            columns={c.personal.map((p) => p.label)}
            rows={[
              { label: T.reference.base.subject, cells: c.personal.map((p) => p.subject) },
              {
                label: T.reference.base.subjectNegative,
                cells: c.personal.map((p) => p.subjectNegative),
              },
              { label: T.reference.base.object, cells: c.personal.map((p) => p.object) },
              { label: T.reference.base.relative, cells: c.personal.map((p) => p.relative) },
            ]}
          />
          <p className="mt-2 text-xs text-muted-foreground">{T.reference.personal.hint}</p>
        </div>
      )}

      <div
        id={classAnchor(c.id, "demonstrative")}
        className="scroll-mt-4 border-b border-border px-4 py-3"
      >
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {T.reference.demonstratives}
        </div>
        <ConcordGrid
          columns={columns}
          rows={[
            { label: T.reference.near, cells: c.concords.map((s) => s.demonstrative.near) },
            { label: T.reference.far, cells: c.concords.map((s) => s.demonstrative.far) },
            {
              label: T.reference.referential,
              cells: c.concords.map((s) => s.demonstrative.referential),
            },
            { label: T.reference.any, cells: c.concords.map((s) => s.demonstrative.any) },
            { label: T.reference.emphatic, cells: c.concords.map((s) => s.demonstrative.emphatic) },
          ]}
        />
      </div>

      <Section id={classAnchor(c.id, "possessive")} title={T.reference.possessive.title}>
        <ConcordGrid
          columns={columns}
          rows={[
            { label: T.reference.possessive.my, cells: c.concords.map((s) => s.possessive.my) },
            { label: T.reference.possessive.your, cells: c.concords.map((s) => s.possessive.your) },
            { label: T.reference.possessive.his, cells: c.concords.map((s) => s.possessive.his) },
            { label: T.reference.possessive.our, cells: c.concords.map((s) => s.possessive.our) },
            {
              label: T.reference.possessive.yourPl,
              cells: c.concords.map((s) => s.possessive.yourPl),
            },
            {
              label: T.reference.possessive.their,
              cells: c.concords.map((s) => s.possessive.their),
            },
          ]}
        />
      </Section>

      <Section id={classAnchor(c.id, "variable")} title={T.reference.variable.title}>
        <ConcordGrid
          columns={columns}
          rows={[
            { label: T.reference.variable.zuri, cells: c.concords.map((s) => s.variable.zuri) },
            { label: T.reference.variable.moja, cells: c.concords.map((s) => s.variable.moja) },
            { label: T.reference.variable.wili, cells: c.concords.map((s) => s.variable.wili) },
            { label: T.reference.variable.ngapi, cells: c.concords.map((s) => s.variable.ngapi) },
            { label: T.reference.variable.ingine, cells: c.concords.map((s) => s.variable.ingine) },
            { label: T.reference.variable.ote, cells: c.concords.map((s) => s.variable.ote) },
            { label: T.reference.variable.eupe, cells: c.concords.map((s) => s.variable.eupe) },
            { label: T.reference.variable.pi, cells: c.concords.map((s) => s.variable.pi) },
            { label: T.reference.variable.enye, cells: c.concords.map((s) => s.variable.enye) },
            { label: T.reference.variable.enyewe, cells: c.concords.map((s) => s.variable.enyewe) },
          ]}
        />
      </Section>

      <div className="border-b border-border px-4 py-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {T.reference.locative}
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <span className="text-xs text-muted-foreground">{T.reference.singular}</span>
          <span className="font-medium">{c.locative.sg}</span>
          <span className="text-xs text-muted-foreground">{T.reference.plural}</span>
          <span className="font-medium">{c.locative.pl}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{T.reference.locativeHint}</p>
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
  );
}

export function Reference() {
  return (
    <ul className="flex flex-col gap-3">
      {nounClasses.map((c) => (
        <ClassCard key={c.id} c={c} />
      ))}

      {/* Verbgrammatik liegt jetzt auf einer eigenen Seite — hier steht nur
          noch der Wegweiser, damit sie von der Ngeli-Seite auffindbar ist. */}
      <li>
        <Link
          to="/verbs"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 active:scale-[0.98]"
        >
          <span className="text-2xl">🗣️</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{T.verbs.title}</p>
            <p className="text-xs text-muted-foreground">{T.reference.verbsHint}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      </li>
    </ul>
  );
}
