import { Avatar, AvatarImage, AvatarFallback } from "tanstack_start_ts";

// Initials-only: the DS ships no avatar assets, and a remote AvatarImage would
// make the card depend on the network.
export const Fallback = () => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarFallback>TB</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>JK</AvatarFallback>
    </Avatar>
  </div>
);

export const WithImage = () => (
  <Avatar>
    {/* 1×1 ochre pixel stands in for a real profile photo. */}
    <AvatarImage
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZDk5MTNjIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTEiIGZpbGw9IiNmZmY0ZTAiLz48cGF0aCBkPSJNMTAgNjRjMC0xMiAxMC0yMCAyMi0yMHMyMiA4IDIyIDIweiIgZmlsbD0iI2ZmZjRlMCIvPjwvc3ZnPg=="
      alt="Profilbild"
    />
    <AvatarFallback>TB</AvatarFallback>
  </Avatar>
);

export const InRow = () => (
  <div className="flex max-w-sm items-center gap-3 rounded-xl border border-border bg-card p-3">
    <Avatar>
      <AvatarFallback>TB</AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">Timo</p>
      <p className="truncate text-xs text-muted-foreground">9 Tage Serie · 128 Vokabeln</p>
    </div>
  </div>
);
