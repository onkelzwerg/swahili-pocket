import { Label, Input, Checkbox } from "tanstack_start_ts";

export const Basic = () => (
  <div className="grid w-full max-w-sm gap-2">
    <Label htmlFor="lesson">Lektion</Label>
    <Input id="lesson" defaultValue="Begrüßungen" />
  </div>
);

export const WithCheckbox = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="audio" defaultChecked />
    <Label htmlFor="audio">Aussprache automatisch abspielen</Label>
  </div>
);
