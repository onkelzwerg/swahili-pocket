import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  Button,
} from "tanstack_start_ts";

export const Open = () => (
  <Drawer defaultOpen>
    <DrawerTrigger asChild>
      <Button variant="outline">Vokabel-Details</Button>
    </DrawerTrigger>
    <DrawerContent>
      <div className="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle className="font-display text-2xl">rafiki</DrawerTitle>
          <DrawerDescription>Freund, Freundin · Ngeli 9/10</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-2">
          <p className="text-sm">Rafiki yangu anasoma Kiswahili.</p>
          <p className="mt-1 text-sm text-muted-foreground">Mein Freund lernt Swahili.</p>
        </div>
        <DrawerFooter>
          <Button>Zum Pool hinzufügen</Button>
          <DrawerClose asChild>
            <Button variant="outline">Schließen</Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
);
