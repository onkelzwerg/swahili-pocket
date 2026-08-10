import { Textarea, Label } from "tanstack_start_ts";

export const Basic = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="note">Notiz</Label>
    <Textarea
      id="note"
      placeholder="Eigener Merksatz zu dieser Vokabel…"
      defaultValue="Rafiki yangu anasoma Kiswahili. — Mein Freund lernt Swahili."
    />
  </div>
);

export const Disabled = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="note-off">Notiz</Label>
    <Textarea id="note-off" disabled defaultValue="Wird gerade synchronisiert…" />
  </div>
);
