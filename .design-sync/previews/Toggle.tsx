import { Toggle } from "tanstack_start_ts";
import { Volume2, Star, Eye } from "lucide-react";

export const States = () => (
  <div className="flex items-center gap-3">
    <Toggle aria-label="Aussprache" pressed>
      <Volume2 />
    </Toggle>
    <Toggle aria-label="Merken">
      <Star />
    </Toggle>
    <Toggle aria-label="Anzeigen" disabled>
      <Eye />
    </Toggle>
  </div>
);

export const Variants = () => (
  <div className="flex items-center gap-3">
    <Toggle pressed>Standard</Toggle>
    <Toggle variant="outline" pressed>
      Outline
    </Toggle>
    <Toggle variant="outline">Aus</Toggle>
  </div>
);

export const Sizes = () => (
  <div className="flex items-center gap-3">
    <Toggle size="sm" pressed>
      Klein
    </Toggle>
    <Toggle size="default" pressed>
      Standard
    </Toggle>
    <Toggle size="lg" pressed>
      Groß
    </Toggle>
  </div>
);
