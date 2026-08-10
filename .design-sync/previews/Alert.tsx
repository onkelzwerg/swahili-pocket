import { Alert, AlertTitle, AlertDescription } from "tanstack_start_ts";
import { CloudOff, CheckCircle2, AlertTriangle } from "lucide-react";

export const Default = () => (
  <Alert className="max-w-md">
    <CheckCircle2 className="h-4 w-4" />
    <AlertTitle>Pool aktualisiert</AlertTitle>
    <AlertDescription>
      12 neue Vokabeln wurden deinem aktiven Pool hinzugefügt.
    </AlertDescription>
  </Alert>
);

export const Destructive = () => (
  <Alert variant="destructive" className="max-w-md">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Synchronisierung fehlgeschlagen</AlertTitle>
    <AlertDescription>
      Deine Änderungen konnten nicht gespeichert werden. Versuche es später nochmal.
    </AlertDescription>
  </Alert>
);

export const Offline = () => (
  <Alert className="max-w-md">
    <CloudOff className="h-4 w-4" />
    <AlertTitle>Offline</AlertTitle>
    <AlertDescription>
      Du übst gerade ohne Verbindung. Bereits geladene Audios funktionieren weiter.
    </AlertDescription>
  </Alert>
);
