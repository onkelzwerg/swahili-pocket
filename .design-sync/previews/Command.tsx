import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "tanstack_start_ts";

export const Palette = () => (
  <Command className="w-full max-w-sm rounded-xl border border-border">
    <CommandInput placeholder="Vokabel oder Befehl suchen…" />
    <CommandList>
      <CommandEmpty>Nichts gefunden.</CommandEmpty>
      <CommandGroup heading="Vorschläge">
        <CommandItem>
          Sitzung starten
          <CommandShortcut>⌘L</CommandShortcut>
        </CommandItem>
        <CommandItem>Vokabel hinzufügen</CommandItem>
        <CommandItem>Pool bearbeiten</CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Msamiati">
        <CommandItem>rafiki — Freund</CommandItem>
        <CommandItem>kitabu — Buch</CommandItem>
        <CommandItem>chakula — Essen</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
);

export const Empty = () => (
  <Command className="w-full max-w-sm rounded-xl border border-border">
    <CommandInput placeholder="Suchen…" value="zzz" />
    <CommandList>
      <CommandEmpty>Keine Vokabel gefunden.</CommandEmpty>
    </CommandList>
  </Command>
);
