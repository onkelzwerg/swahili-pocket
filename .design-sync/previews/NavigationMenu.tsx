import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "tanstack_start_ts";

// `defaultValue` on the root opens one menu, so the card shows the panel and
// not just the bar. NavigationMenuViewport sizes itself from the Radix
// --radix-navigation-menu-viewport-* vars, set at runtime.
export const Open = () => (
  <div className="flex justify-center pb-64 pt-2">
    <NavigationMenu defaultValue="lernen">
      <NavigationMenuList>
        <NavigationMenuItem value="lernen">
          <NavigationMenuTrigger>Lernen</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[380px] gap-2 p-4 md:grid-cols-2">
              {[
                ["Karten üben", "Fällige Wiederholungen"],
                ["Neue Vokabeln", "Noch nie gesehen"],
                ["Dialoge", "Ganze Sätze im Kontext"],
                ["Nomenklassen", "Ngeli-Training"],
              ].map(([title, desc]) => (
                <li key={title}>
                  <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent">
                    <div className="text-sm font-medium">{title}</div>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="lexikon">
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>Lexikon</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
);
