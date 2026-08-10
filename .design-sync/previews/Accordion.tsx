import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "tanstack_start_ts";

export const Single = () => (
  <Accordion type="single" collapsible defaultValue="ngeli" className="w-full max-w-sm">
    <AccordionItem value="ngeli">
      <AccordionTrigger>Was sind Ngeli?</AccordionTrigger>
      <AccordionContent>
        Die Nomenklassen des Swahili. Jede Klasse hat eigene Präfixe für Singular und Plural und
        bestimmt, wie Adjektive und Verben angeglichen werden.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="pool">
      <AccordionTrigger>Wie funktioniert der Pool?</AccordionTrigger>
      <AccordionContent>
        Dein Pool enthält alle Vokabeln, die aktiv wiederholt werden. Gemeisterte Wörter wandern
        automatisch heraus.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="offline">
      <AccordionTrigger>Funktioniert die App offline?</AccordionTrigger>
      <AccordionContent>
        Ja. Bereits geladene Karten und Audios stehen ohne Verbindung zur Verfügung.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export const Multiple = () => (
  <Accordion type="multiple" defaultValue={["a", "b"]} className="w-full max-w-sm">
    <AccordionItem value="a">
      <AccordionTrigger>Begrüßungen</AccordionTrigger>
      <AccordionContent>Habari, Karibu, Kwaheri — 12 Vokabeln.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="b">
      <AccordionTrigger>Zahlen 1–20</AccordionTrigger>
      <AccordionContent>Moja, mbili, tatu — 20 Vokabeln.</AccordionContent>
    </AccordionItem>
  </Accordion>
);
