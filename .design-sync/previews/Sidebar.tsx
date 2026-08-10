import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarTrigger,
} from "tanstack_start_ts";
import { Home, BookOpen, Layers, MessagesSquare, GraduationCap } from "lucide-react";

// Sidebar must sit inside SidebarProvider — it reads open/collapsed state from
// that context. NOTE: this app never defined the --sidebar-* token family in
// src/styles.css, so the sidebar surface falls back to the page background
// instead of its own tone. See NOTES.md.
const nav = [
  [Home, "Home", null],
  [BookOpen, "Lexikon", "128"],
  [Layers, "Üben", "24"],
  [MessagesSquare, "Dialoge", null],
  [GraduationCap, "Klassen", null],
] as const;

export const AppShell = () => (
  <SidebarProvider className="h-96 min-h-0 overflow-hidden rounded-xl border border-border">
    <Sidebar collapsible="none">
      <SidebarHeader className="px-4 py-3">
        <span className="font-display text-base font-semibold">Swahili Pocket</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(([Icon, label, count]) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={label === "Lexikon"}>
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                  {count && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 text-xs text-muted-foreground">
        9 Tage Serie
      </SidebarFooter>
    </Sidebar>
    <SidebarInset>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <SidebarTrigger />
        <span className="font-display text-sm font-semibold">Msamiati</span>
      </div>
      <div className="p-4 text-sm text-muted-foreground">
        Wähle links einen Bereich, um loszulegen.
      </div>
    </SidebarInset>
  </SidebarProvider>
);
