import type { Dialogue } from "./types";

// Aus dem ehemaligen Cloud-Dialog-Pool exportierte Dialoge (Stand 2026-07-05).
// Kuratiert und statisch ausgeliefert — kein Backend mehr nötig.
export const extraDialogues: Dialogue[] = [
  {
    id: "pool-habari-za-mchana",
    title: "Habari za mchana / Small Talk",
    titleDe: "Smalltalk am Nachmittag",
    emoji: "☀️",
    level: "beginner",
    turns: [
      {
        speaker: "A",
        sw: "Hujambo rafiki yangu! Habari za asubuhi?",
        de: "Hallo mein Freund! Wie geht es dir heute Morgen?",
      },
      {
        speaker: "B",
        sw: "Sijambo sana, asante. Na wewe, habari yako?",
        de: "Mir geht es sehr gut, danke. Und dir, wie geht es dir?",
      },
      {
        speaker: "A",
        sw: "Nzuri sana! Je, unatoka wapi?",
        de: "Sehr gut! Sag mal, woher kommst du?",
      },
      {
        speaker: "B",
        sw: "Ninatoka Ujerumani, lakini sasa ninakaa hapa.",
        de: "Ich komme aus Deutschland, aber jetzt wohne ich hier.",
      },
      {
        speaker: "A",
        sw: "Karibu sana! Karibu katika Tanzania.",
        de: "Herzlich willkommen! Willkommen in Tansania.",
      },
    ],
  },
  {
    id: "pool-kukutana-barabarani",
    title: "Kukutana Barabarani",
    titleDe: "Begegnung auf der Straße",
    emoji: "👋",
    level: "intermediate",
    turns: [
      {
        speaker: "A",
        sw: "Hadiyth! Naona umependeza leo, kwani unaelekea kwenye sherehe fulani?",
        de: "Hadiyth! Ich sehe, du hast dich heute schick gemacht, bist du etwa auf dem Weg zu einer Feier?",
      },
      {
        speaker: "B",
        sw: "Hapana bwana, naenda tu mjini kukutana na rafiki yangu wa zamani, Juma.",
        de: "Nein mein Freund, ich gehe nur in die Stadt, um mich mit meinem alten Freund Juma zu treffen.",
      },
      {
        speaker: "C",
        sw: "Samahani kwa kuingilia mazungumzo, lakini nimesikia jina la Juma, mnamzungumzia yule mwalimu?",
        de: "Entschuldigt die Störung des Gesprächs, aber ich habe Jumas Namen gehört, sprecht ihr von dem Lehrer?",
      },
      {
        speaker: "A",
        sw: "Haswa! Ni yule yule anayefundisha shule ya upili, unamfahamu kumbe?",
        de: "Genau! Es ist derselbe, der an der Highschool unterrichtet, du kennst ihn also?",
      },
      {
        speaker: "B",
        sw: "Dunia ni ndogo sana! Juma ndiye alitutambulisha mimi na huyu ndugu yetu hapa.",
        de: "Die Welt ist echt klein! Juma hat mich und unseren Bruder hier einander vorgestellt.",
      },
      {
        speaker: "C",
        sw: "Kweli kabisa, alikuwa jirani yangu miaka miwili iliyopita kule makazi ya Upanga.",
        de: "Ganz genau, er war vor zwei Jahren mein Nachbar in der Siedlung Upanga.",
      },
      {
        speaker: "A",
        sw: "Basi tujiunge wote, si tunaelekea upande ule ule wa mjini?",
        de: "Dann lasst uns doch alle zusammen gehen, wir sind doch eh in dieselbe Richtung Richtung Stadt unterwegs, oder?",
      },
      {
        speaker: "B",
        sw: "Wazo zuri sana, twendeni tukampige butwaa Juma na habari hizi za kushtukiza!",
        de: "Sehr gute Idee, lasst uns gehen und Juma mit diesen überraschenden Neuigkeiten verblüffen!",
      },
    ],
  },
  {
    id: "pool-mkahawani",
    title: "Mkahawani",
    titleDe: "Im Restaurant (zu dritt)",
    emoji: "🍲",
    level: "beginner",
    turns: [
      {
        speaker: "A",
        sw: "Karibuni wateja! Hamjambo?",
        de: "Willkommen, Kunden! Wie geht es euch?",
      },
      {
        speaker: "B",
        sw: "Hatujambo sana. Tunaweza kupata meza?",
        de: "Uns geht es sehr gut. Können wir einen Tisch bekommen?",
      },
      {
        speaker: "C",
        sw: "Ndiyo, tunataka kuketi karibu na dirisha.",
        de: "Ja, wir möchten gerne am Fenster sitzen.",
      },
      {
        speaker: "A",
        sw: "Sawa, karibuni hapa. Mngependa kula nini?",
        de: "In Ordnung, willkommen hier. Was möchtet ihr essen?",
      },
      {
        speaker: "B",
        sw: "Mimi nitakula wali na kuku, tafadhali.",
        de: "Ich werde Reis mit Hähnchen essen, bitte.",
      },
      {
        speaker: "C",
        sw: "Na mimi nitakula samaki na chipsi.",
        de: "Und ich werde Fisch mit Pommes essen.",
      },
      {
        speaker: "A",
        sw: "Je, mnataka vinywaji baridi pia?",
        de: "Wollt ihr auch kalte Getränke?",
      },
      {
        speaker: "B",
        sw: "Ndiyo, tuletee maji mawili, asante.",
        de: "Ja, bring uns zwei Wasser, danke.",
      },
    ],
  },
];
