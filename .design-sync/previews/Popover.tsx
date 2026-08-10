import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Label,
  Slider,
} from "tanstack_start_ts";
import { SlidersHorizontal } from "lucide-react";

export const Open = () => (
  <div className="flex justify-center pb-48 pt-4">
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal /> Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="grid gap-4">
          <div>
            <h4 className="font-display text-sm font-semibold">Kartenfilter</h4>
            <p className="text-sm text-muted-foreground">Gilt nur für diese Sitzung.</p>
          </div>
          <div className="grid gap-2">
            <Label>Karten pro Sitzung</Label>
            <Slider defaultValue={[20]} min={5} max={50} step={5} />
          </div>
          <Button size="sm">Anwenden</Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
);
