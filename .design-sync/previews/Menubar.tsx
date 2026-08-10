import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
} from "tanstack_start_ts";

// Menubar's Root takes `defaultValue` = the value of the MenubarMenu to open,
// so the card can show a real open menu rather than just the bar.
export const Open = () => (
  <div className="pb-64">
    <Menubar defaultValue="lernen">
      <MenubarMenu value="lernen">
        <MenubarTrigger>Lernen</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Sitzung starten <MenubarShortcut>⌘L</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Nur fällige Karten</MenubarItem>
          <MenubarSeparator />
          <MenubarCheckboxItem checked>Aussprache automatisch</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="pool">
        <MenubarTrigger>Pool</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Vokabel hinzufügen</MenubarItem>
          <MenubarItem>Importieren…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="hilfe">
        <MenubarTrigger>Hilfe</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Über Swahili Pocket</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
);
