import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  Label,
} from "tanstack_start_ts";

export const Closed = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label>Lektion</Label>
    <Select defaultValue="greetings">
      <SelectTrigger>
        <SelectValue placeholder="– wählen –" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="greetings">Begrüßungen</SelectItem>
        <SelectItem value="numbers">Zahlen 1–20</SelectItem>
        <SelectItem value="classes">Nomenklassen</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export const Placeholder = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label>Ngeli</Label>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="– wählen –" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Singular / Plural</SelectLabel>
          <SelectItem value="1-2">1/2 — Menschen</SelectItem>
          <SelectItem value="3-4">3/4 — Pflanzen, Dinge</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Sonstige</SelectLabel>
          <SelectItem value="9-10">9/10 — Tiere, Lehnwörter</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

export const Disabled = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label className="opacity-50">Stimme</Label>
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder="Offline nicht verfügbar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="f">Weiblich</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
