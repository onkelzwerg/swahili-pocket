import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "tanstack_start_ts";

// `config` maps each data key to a label and a colour; ChartStyle turns those
// into the --color-<key> vars the recharts children read.
const config = {
  gelernt: { label: "Gelernt", color: "var(--primary)" },
  faellig: { label: "Fällig", color: "var(--ochre)" },
};

const week = [
  { tag: "Mo", gelernt: 18, faellig: 6 },
  { tag: "Di", gelernt: 24, faellig: 9 },
  { tag: "Mi", gelernt: 12, faellig: 14 },
  { tag: "Do", gelernt: 30, faellig: 4 },
  { tag: "Fr", gelernt: 22, faellig: 8 },
  { tag: "Sa", gelernt: 8, faellig: 11 },
  { tag: "So", gelernt: 26, faellig: 5 },
];

export const Bars = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="font-display">Diese Woche</CardTitle>
      <CardDescription>Gelernte und fällige Karten pro Tag</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={config} className="h-56 w-full">
        <BarChart data={week}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="tag" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="gelernt" fill="var(--color-gelernt)" radius={4} />
          <Bar dataKey="faellig" fill="var(--color-faellig)" radius={4} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export const Trend = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="font-display">Lernkurve</CardTitle>
      <CardDescription>Gelernte Vokabeln pro Tag</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={config} className="h-56 w-full">
        <LineChart data={week}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="tag" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="gelernt"
            stroke="var(--color-gelernt)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ChartContainer>
    </CardContent>
  </Card>
);
