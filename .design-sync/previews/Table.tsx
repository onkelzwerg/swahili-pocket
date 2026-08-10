import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  Badge,
} from "tanstack_start_ts";

const rows = [
  { sw: "rafiki", de: "Freund", ngeli: "9/10", seen: 12 },
  { sw: "kitabu", de: "Buch", ngeli: "7/8", seen: 8 },
  { sw: "mtoto", de: "Kind", ngeli: "1/2", seen: 21 },
  { sw: "chakula", de: "Essen", ngeli: "7/8", seen: 5 },
  { sw: "safari", de: "Reise", ngeli: "9/10", seen: 3 },
];

export const Basic = () => (
  <Table>
    <TableCaption>Vokabeln aus deinem aktiven Pool.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Swahili</TableHead>
        <TableHead>Deutsch</TableHead>
        <TableHead>Ngeli</TableHead>
        <TableHead className="text-right">Wiederholt</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => (
        <TableRow key={r.sw}>
          <TableCell className="font-medium">{r.sw}</TableCell>
          <TableCell>{r.de}</TableCell>
          <TableCell>
            <Badge variant="secondary">{r.ngeli}</Badge>
          </TableCell>
          <TableCell className="text-right">{r.seen}×</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={3}>Gesamt</TableCell>
        <TableCell className="text-right">49×</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

export const Compact = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Lektion</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Begrüßungen</TableCell>
        <TableCell>
          <Badge>Abgeschlossen</Badge>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Zahlen 1–20</TableCell>
        <TableCell>
          <Badge variant="secondary">Läuft</Badge>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Nomenklassen</TableCell>
        <TableCell>
          <Badge variant="outline">Offen</Badge>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
