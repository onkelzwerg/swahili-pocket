import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Button,
} from "tanstack_start_ts";
import { Volume2 } from "lucide-react";

// Tooltip needs TooltipProvider above it, and `open` keeps the bubble mounted so
// the card shows the tooltip itself rather than just its trigger.
export const Open = () => (
  <TooltipProvider>
    <div className="flex justify-center pt-16">
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="secondary" size="icon" aria-label="Aussprache anhören">
            <Volume2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Aussprache anhören</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);

export const Sides = () => (
  <TooltipProvider>
    <div className="flex justify-center gap-16 py-16">
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline">Oben</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Standard-Position</TooltipContent>
      </Tooltip>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline">Rechts</Button>
        </TooltipTrigger>
        <TooltipContent side="right">Neben dem Auslöser</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);
