import { RadioGroup, RadioGroupItem, Label } from "tanstack_start_ts";

export const Basic = () => (
  <RadioGroup defaultValue="mittel" className="grid gap-3">
    {[
      ["leicht", "Leicht — 10 Karten"],
      ["mittel", "Mittel — 20 Karten"],
      ["schwer", "Schwer — 40 Karten"],
    ].map(([value, label]) => (
      <div key={value} className="flex items-center gap-2">
        <RadioGroupItem value={value} id={value} />
        <Label htmlFor={value}>{label}</Label>
      </div>
    ))}
  </RadioGroup>
);

export const Disabled = () => (
  <RadioGroup defaultValue="de" className="grid gap-3">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="de" id="lang-de" />
      <Label htmlFor="lang-de">Deutsch → Swahili</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="sw" id="lang-sw" disabled />
      <Label htmlFor="lang-sw" className="opacity-50">
        Swahili → Deutsch (bald verfügbar)
      </Label>
    </div>
  </RadioGroup>
);
