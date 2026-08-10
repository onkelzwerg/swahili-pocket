import { Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "tanstack_start_ts";

export const Basic = () => (
  <Tabs defaultValue="karten" className="w-full max-w-sm">
    <TabsList>
      <TabsTrigger value="karten">Karten</TabsTrigger>
      <TabsTrigger value="pool">Pool</TabsTrigger>
      <TabsTrigger value="stats">Statistik</TabsTrigger>
    </TabsList>
    <TabsContent value="karten" className="pt-4">
      <p className="text-sm text-muted-foreground">
        24 Karten sind heute fällig. Starte eine Sitzung, um sie zu wiederholen.
      </p>
    </TabsContent>
    <TabsContent value="pool" className="pt-4">
      <p className="text-sm text-muted-foreground">128 Vokabeln in deinem aktiven Pool.</p>
    </TabsContent>
    <TabsContent value="stats" className="pt-4">
      <p className="text-sm text-muted-foreground">9 Tage Serie.</p>
    </TabsContent>
  </Tabs>
);

export const WithCounts = () => (
  <Tabs defaultValue="faellig" className="w-full max-w-sm">
    <TabsList>
      <TabsTrigger value="faellig" className="gap-2">
        Fällig <Badge variant="secondary">24</Badge>
      </TabsTrigger>
      <TabsTrigger value="neu" className="gap-2">
        Neu <Badge variant="secondary">12</Badge>
      </TabsTrigger>
    </TabsList>
    <TabsContent value="faellig" className="pt-4">
      <p className="text-sm text-muted-foreground">Wiederholungen für heute.</p>
    </TabsContent>
    <TabsContent value="neu" className="pt-4">
      <p className="text-sm text-muted-foreground">Noch nie gesehene Karten.</p>
    </TabsContent>
  </Tabs>
);
