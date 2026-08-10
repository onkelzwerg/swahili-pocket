import { Badge } from "tanstack_start_ts";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>Neu</Badge>
    <Badge variant="secondary">Ngeli 9/10</Badge>
    <Badge variant="outline">Offen</Badge>
    <Badge variant="destructive">Fällig</Badge>
  </div>
);

export const InContext = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="secondary">Begrüßungen</Badge>
    <Badge variant="secondary">Zahlen</Badge>
    <Badge variant="secondary">Reisen</Badge>
    <Badge variant="outline">+4 weitere</Badge>
  </div>
);

export const Counts = () => (
  <div className="flex flex-wrap items-center gap-3">
    <span className="inline-flex items-center gap-2 text-sm">
      Heute fällig <Badge>24</Badge>
    </span>
    <span className="inline-flex items-center gap-2 text-sm">
      Gemeistert <Badge variant="secondary">128</Badge>
    </span>
  </div>
);
