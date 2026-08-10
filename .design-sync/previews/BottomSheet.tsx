import type { ReactNode } from "react";
import { BottomSheet, Button, Label, Input } from "tanstack_start_ts";

// BottomSheet is a full-screen overlay driven by `open`; it renders nothing
// when closed, so every cell mounts it open.
//
// The wrapper matters: BottomSheet's root is `fixed inset-0`, and `fixed`
// resolves against the nearest ancestor with a transform — which here is the
// card harness's own wrapper, sized 0. `translateZ(0)` plus an explicit height
// makes THIS div the containing block, so the sheet fills a real box instead of
// collapsing. In the app there is no transformed ancestor and it fills the
// viewport normally.
const Stage = ({ children }: { children: ReactNode }) => (
  <div className="relative h-[620px] w-full overflow-hidden" style={{ transform: "translateZ(0)" }}>
    {children}
  </div>
);

export const Open = () => (
  <Stage>
  <BottomSheet
    open
    onClose={() => {}}
    eyebrow="Msamiati"
    title="Vokabel bearbeiten"
    footer={
      <>
        <Button variant="outline">Abbrechen</Button>
        <Button>Speichern</Button>
      </>
    }
  >
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="bs-sw">Swahili</Label>
        <Input id="bs-sw" defaultValue="rafiki" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bs-de">Deutsch</Label>
        <Input id="bs-de" defaultValue="Freund, Freundin" />
      </div>
    </div>
    </BottomSheet>
  </Stage>
);

export const WithoutFooter = () => (
  <Stage>
    <BottomSheet open onClose={() => {}} title="Über Ngeli">
      <p className="text-sm text-muted-foreground">
        Die Nomenklassen des Swahili. Jede Klasse hat eigene Präfixe für Singular und Plural und
        bestimmt die Kongruenz von Adjektiven und Verben.
      </p>
    </BottomSheet>
  </Stage>
);
