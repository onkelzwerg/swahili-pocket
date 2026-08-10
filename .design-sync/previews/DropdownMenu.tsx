import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  Button,
} from "tanstack_start_ts";
import { MoreHorizontal } from "lucide-react";

export const Open = () => (
  <div className="flex justify-center pb-72 pt-4">
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Aktionen">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="start">
        <DropdownMenuLabel>Vokabel</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Bearbeiten
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Aussprache anhören</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Anzeige</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked>Beispielsatz</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Ngeli</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {/* This shadcn version has no `variant` prop on menu items — a
            destructive action is styled with the destructive token. */}
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          Aus Pool entfernen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
