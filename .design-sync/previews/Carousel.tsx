import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  Card,
  CardContent,
} from "tanstack_start_ts";

const cards = [
  ["rafiki", "Freund"],
  ["kitabu", "Buch"],
  ["mtoto", "Kind"],
  ["chakula", "Essen"],
];

export const VocabCards = () => (
  <div className="px-12">
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {cards.map(([sw, de]) => (
          <CarouselItem key={sw}>
            <Card>
              <CardContent className="flex aspect-square flex-col items-center justify-center gap-2">
                <span className="font-display text-3xl">{sw}</span>
                <span className="text-sm text-muted-foreground">{de}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);

export const MultiPerView = () => (
  <div className="px-12">
    <Carousel className="w-full max-w-sm" opts={{ align: "start" }}>
      <CarouselContent className="-ml-2">
        {["Begrüßungen", "Zahlen", "Reisen", "Essen", "Familie"].map((t) => (
          <CarouselItem key={t} className="basis-1/2 pl-2">
            <div className="rounded-xl bg-secondary px-4 py-8 text-center text-sm text-secondary-foreground">
              {t}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);
