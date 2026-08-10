import { Slider, Label } from "tanstack_start_ts";

export const Basic = () => (
  <div className="grid w-full max-w-sm gap-3">
    <Label>Karten pro Sitzung</Label>
    <Slider defaultValue={[20]} min={5} max={50} step={5} />
  </div>
);

export const Range = () => (
  <div className="grid w-full max-w-sm gap-3">
    <Label>Schwierigkeitsbereich</Label>
    <Slider defaultValue={[20, 70]} min={0} max={100} step={5} />
  </div>
);

// No Disabled cell: slider.tsx only carries `disabled:opacity-50` on the Thumb,
// and the `disabled:` variant never matches a div, so a disabled Slider is
// pixel-identical to an enabled one in this DS. See NOTES.md.

export const Steps = () => (
  <div className="grid w-full max-w-sm gap-3">
    <Label>Sprechgeschwindigkeit</Label>
    <Slider defaultValue={[75]} min={50} max={150} step={25} />
  </div>
);
