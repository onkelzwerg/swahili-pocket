import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Button,
  Input,
  Label,
} from "tanstack_start_ts";

// `defaultOpen` keeps the dialog mounted so the card shows the real open state
// instead of just its trigger.
export const Open = () => (
  <Dialog defaultOpen>
    <DialogTrigger asChild>
      <Button variant="outline">Vokabel hinzufügen</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display">Neue Vokabel</DialogTitle>
        <DialogDescription>
          Füge ein Wort zu deinem Pool hinzu. Du kannst es später jederzeit bearbeiten.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="sw">Swahili</Label>
          <Input id="sw" defaultValue="rafiki" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="de">Deutsch</Label>
          <Input id="de" defaultValue="Freund, Freundin" />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Abbrechen</Button>
        </DialogClose>
        <Button>Speichern</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
