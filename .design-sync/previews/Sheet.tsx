import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  Button,
  Label,
  Switch,
  Separator,
} from "tanstack_start_ts";

export const Open = () => (
  <Sheet defaultOpen>
    <SheetTrigger asChild>
      <Button variant="outline">Einstellungen</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="font-display">Übungseinstellungen</SheetTitle>
        <SheetDescription>Gilt für alle künftigen Sitzungen.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-6">
        {[
          ["Aussprache automatisch", true],
          ["Beispielsätze zeigen", true],
          ["Nur fällige Karten", false],
        ].map(([label, on]) => (
          <div key={label as string}>
            <div className="flex items-center justify-between">
              <Label>{label as string}</Label>
              <Switch defaultChecked={on as boolean} />
            </div>
            <Separator className="mt-4" />
          </div>
        ))}
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button>Fertig</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);
