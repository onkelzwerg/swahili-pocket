import { Checkbox, Label } from "tanstack_start_ts";

export const States = () => (
  <div className="grid gap-3">
    <div className="flex items-center gap-2">
      <Checkbox id="c1" defaultChecked />
      <Label htmlFor="c1">Aussprache abspielen</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="c2" />
      <Label htmlFor="c2">Beispielsatz anzeigen</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="c3" disabled />
      <Label htmlFor="c3" className="opacity-50">
        Offline-Audio (nicht verfügbar)
      </Label>
    </div>
  </div>
);

export const PoolPicker = () => (
  <div className="grid gap-3">
    {[
      ["Begrüßungen", true],
      ["Zahlen 1–20", true],
      ["Nomenklassen", false],
      ["Reisen", false],
    ].map(([label, on]) => (
      <div key={label as string} className="flex items-center gap-2">
        <Checkbox id={label as string} defaultChecked={on as boolean} />
        <Label htmlFor={label as string}>{label as string}</Label>
      </div>
    ))}
  </div>
);
