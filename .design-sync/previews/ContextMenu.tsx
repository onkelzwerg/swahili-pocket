import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuLabel,
} from "tanstack_start_ts";

// Radix's ContextMenu.Root has no `defaultOpen` — it only opens from a real
// contextmenu event — so the card shows the trigger surface. The menu markup
// below is the composition to copy; it is what appears on right-click.
export const Trigger = () => (
  <ContextMenu>
    <ContextMenuTrigger className="flex h-32 w-full max-w-sm items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
      Rechtsklick auf eine Vokabelkarte
    </ContextMenuTrigger>
    <ContextMenuContent className="w-56">
      <ContextMenuLabel>rafiki</ContextMenuLabel>
      <ContextMenuItem>
        Bearbeiten <ContextMenuShortcut>⌘E</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem>Aussprache anhören</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem checked>Beispielsatz zeigen</ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      {/* No `variant` prop on menu items in this version — use the token. */}
      <ContextMenuItem className="text-destructive focus:text-destructive">
        Aus Pool entfernen
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
);
