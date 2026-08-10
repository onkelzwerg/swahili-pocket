import { HoverCard, HoverCardTrigger, HoverCardContent, Badge } from "tanstack_start_ts";

export const Open = () => (
  <div className="flex justify-center pb-56 pt-4">
    <HoverCard open>
      <HoverCardTrigger asChild>
        <button className="font-display text-lg underline decoration-dotted underline-offset-4">
          ngeli
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold">Ngeli</h4>
            <Badge variant="secondary">Grammatik</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Die Nomenklassen des Swahili. Jede Klasse hat eigene Präfixe für Singular und Plural und
            bestimmt die Kongruenz von Adjektiven und Verben.
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
);
