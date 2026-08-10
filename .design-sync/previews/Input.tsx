import { Input, Label } from "tanstack_start_ts";

export const Basic = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="sw">Swahili</Label>
    <Input id="sw" placeholder="z. B. rafiki" />
  </div>
);

export const States = () => (
  <div className="grid w-full max-w-sm gap-4">
    <Input defaultValue="kitabu" />
    <Input placeholder="Noch nichts eingegeben" />
    <Input defaultValue="chakula" disabled />
  </div>
);

export const Types = () => (
  <div className="grid w-full max-w-sm gap-4">
    <Input type="search" placeholder="Vokabel suchen…" />
    <Input type="email" placeholder="du@beispiel.de" />
    <Input type="number" defaultValue={20} />
  </div>
);
