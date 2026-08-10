import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "tanstack_start_ts";

export const Basic = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle className="font-display">Msamiati wa leo</CardTitle>
      <CardDescription>Zwölf neue Vokabeln warten auf dich.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Wiederhole die Wörter von gestern, bevor du neue Karten aufdeckst. So bleibt der Wortschatz
        länger im Gedächtnis.
      </p>
    </CardContent>
    <CardFooter>
      <Button className="w-full">Üben starten</Button>
    </CardFooter>
  </Card>
);

export const WithStats = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle className="font-display">Dein Fortschritt</CardTitle>
      <CardDescription>Diese Woche</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="font-display text-2xl font-semibold text-primary">128</p>
        <p className="text-xs text-muted-foreground">Gelernt</p>
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-ochre">24</p>
        <p className="text-xs text-muted-foreground">Offen</p>
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-forest">9</p>
        <p className="text-xs text-muted-foreground">Tage Serie</p>
      </div>
    </CardContent>
  </Card>
);

export const VocabCard = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle className="font-display text-2xl">rafiki</CardTitle>
          <CardDescription>Freund, Freundin</CardDescription>
        </div>
        <Badge variant="secondary">Ngeli 9/10</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm">
        <span className="font-medium">Rafiki yangu</span> anasoma Kiswahili.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Mein Freund lernt Swahili.</p>
    </CardContent>
    <CardFooter className="gap-2">
      <Button variant="outline" className="flex-1">
        Kenne ich
      </Button>
      <Button className="flex-1">Nochmal</Button>
    </CardFooter>
  </Card>
);
