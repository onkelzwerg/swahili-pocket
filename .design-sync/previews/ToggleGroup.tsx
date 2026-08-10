import { ToggleGroup, ToggleGroupItem } from "tanstack_start_ts";

export const Single = () => (
  <ToggleGroup type="single" defaultValue="mittel" variant="outline">
    <ToggleGroupItem value="leicht">Leicht</ToggleGroupItem>
    <ToggleGroupItem value="mittel">Mittel</ToggleGroupItem>
    <ToggleGroupItem value="schwer">Schwer</ToggleGroupItem>
  </ToggleGroup>
);

export const Multiple = () => (
  <ToggleGroup type="multiple" defaultValue={["begruessungen", "zahlen"]} variant="outline">
    <ToggleGroupItem value="begruessungen">Begrüßungen</ToggleGroupItem>
    <ToggleGroupItem value="zahlen">Zahlen</ToggleGroupItem>
    <ToggleGroupItem value="reisen">Reisen</ToggleGroupItem>
  </ToggleGroup>
);

export const Sizes = () => (
  <div className="grid gap-3">
    <ToggleGroup type="single" defaultValue="a" size="sm" variant="outline">
      <ToggleGroupItem value="a">Klein</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup type="single" defaultValue="a" size="lg" variant="outline">
      <ToggleGroupItem value="a">Groß</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
    </ToggleGroup>
  </div>
);
