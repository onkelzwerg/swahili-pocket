import { AspectRatio } from "tanstack_start_ts";

export const Wide = () => (
  <div className="w-full max-w-sm">
    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-ochre/20">
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-lg text-ochre-foreground">16 : 9</span>
      </div>
    </AspectRatio>
  </div>
);

export const Square = () => (
  <div className="w-40">
    <AspectRatio ratio={1} className="overflow-hidden rounded-xl bg-forest/15">
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-lg text-forest">1 : 1</span>
      </div>
    </AspectRatio>
  </div>
);
