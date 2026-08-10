import { Button } from "tanstack_start_ts";
import { Plus, Volume2, Trash2 } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Speichern</Button>
    <Button variant="secondary">Abbrechen</Button>
    <Button variant="outline">Zurück</Button>
    <Button variant="ghost">Überspringen</Button>
    <Button variant="destructive">Löschen</Button>
    <Button variant="link">Mehr erfahren</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Klein</Button>
    <Button size="default">Standard</Button>
    <Button size="lg">Groß</Button>
    <Button size="icon" aria-label="Vokabel hinzufügen">
      <Plus />
    </Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>
      <Plus /> Vokabel hinzufügen
    </Button>
    <Button variant="secondary">
      <Volume2 /> Anhören
    </Button>
    <Button variant="destructive">
      <Trash2 /> Aus Pool entfernen
    </Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>Speichern…</Button>
    <Button variant="outline" disabled>
      Abbrechen
    </Button>
    <Button variant="ghost" disabled>
      Überspringen
    </Button>
  </div>
);
