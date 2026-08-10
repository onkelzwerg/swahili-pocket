import { Collapsible, CollapsibleTrigger, CollapsibleContent, Button } from "tanstack_start_ts";
import { ChevronsUpDown } from "lucide-react";

export const Open = () => (
  <Collapsible defaultOpen className="w-full max-w-sm space-y-2">
    <div className="flex items-center justify-between gap-4">
      <h4 className="font-display text-sm font-semibold">Beispielsätze</h4>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aufklappen">
          <ChevronsUpDown />
        </Button>
      </CollapsibleTrigger>
    </div>
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
      Rafiki yangu anasoma Kiswahili.
    </div>
    <CollapsibleContent className="space-y-2">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
        Ninakwenda sokoni na rafiki.
      </div>
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
        Rafiki zangu wanacheza mpira.
      </div>
    </CollapsibleContent>
  </Collapsible>
);

export const Closed = () => (
  <Collapsible className="w-full max-w-sm space-y-2">
    <div className="flex items-center justify-between gap-4">
      <h4 className="font-display text-sm font-semibold">Beispielsätze</h4>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aufklappen">
          <ChevronsUpDown />
        </Button>
      </CollapsibleTrigger>
    </div>
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
      Rafiki yangu anasoma Kiswahili.
    </div>
    <CollapsibleContent className="space-y-2">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
        Ninakwenda sokoni na rafiki.
      </div>
    </CollapsibleContent>
  </Collapsible>
);
