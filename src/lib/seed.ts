import type { VocabEntry, Dialogue, NounClassInfo } from "./types";

export function seedVocab(): VocabEntry[] {
  const now = Date.now();
  const base: Omit<VocabEntry, "id" | "box" | "nextReview" | "createdAt">[] = [
    {
      swahili: "habari",
      german: "Hallo / Wie geht's",
      partOfSpeech: "noun",
      nounClass: "N",
      examples: [
        { sw: "Habari yako?", de: "Wie geht es dir?" },
        { sw: "Habari za asubuhi.", de: "Guten Morgen." },
      ],
    },
    {
      swahili: "asante",
      german: "danke",
      partOfSpeech: "other",
      examples: [
        { sw: "Asante sana.", de: "Vielen Dank." },
        { sw: "Asante kwa msaada.", de: "Danke für die Hilfe." },
      ],
    },
    {
      swahili: "mtoto",
      german: "Kind",
      partOfSpeech: "noun",
      nounClass: "M-Wa",
      examples: [
        { sw: "Mtoto analala.", de: "Das Kind schläft." },
        { sw: "Watoto wanacheza.", de: "Die Kinder spielen." },
      ],
    },
    {
      swahili: "kitabu",
      german: "Buch",
      partOfSpeech: "noun",
      nounClass: "Ki-Vi",
      examples: [
        { sw: "Kitabu kipo mezani.", de: "Das Buch liegt auf dem Tisch." },
        { sw: "Vitabu vyangu ni vipya.", de: "Meine Bücher sind neu." },
      ],
    },
    {
      swahili: "kula",
      german: "essen",
      partOfSpeech: "verb",
      examples: [
        { sw: "Ninakula wali.", de: "Ich esse Reis." },
        { sw: "Tunakula pamoja.", de: "Wir essen zusammen." },
      ],
    },
    {
      swahili: "kunywa",
      german: "trinken",
      partOfSpeech: "verb",
      examples: [
        { sw: "Anakunywa maji.", de: "Er/sie trinkt Wasser." },
        { sw: "Ninakunywa chai asubuhi.", de: "Ich trinke morgens Tee." },
      ],
    },
    {
      swahili: "mzuri",
      german: "gut / schön",
      partOfSpeech: "adjective",
      examples: [
        { sw: "Siku njema.", de: "Einen schönen Tag." },
        { sw: "Mtu mzuri.", de: "Ein guter Mensch." },
      ],
    },
    {
      swahili: "mji",
      german: "Stadt",
      partOfSpeech: "noun",
      nounClass: "M-Mi",
      examples: [
        { sw: "Mji huu ni mkubwa.", de: "Diese Stadt ist groß." },
        { sw: "Miji ya pwani ni mizuri.", de: "Die Küstenstädte sind schön." },
      ],
    },
    {
      swahili: "maji",
      german: "Wasser",
      partOfSpeech: "noun",
      nounClass: "Ji-Ma",
      examples: [
        { sw: "Maji ni baridi.", de: "Das Wasser ist kalt." },
        { sw: "Naomba maji tafadhali.", de: "Ich möchte bitte Wasser." },
      ],
    },
    {
      swahili: "rafiki",
      german: "Freund",
      partOfSpeech: "noun",
      nounClass: "N",
      examples: [
        { sw: "Yeye ni rafiki yangu.", de: "Er/sie ist mein Freund." },
        { sw: "Marafiki wangu wapo hapa.", de: "Meine Freunde sind hier." },
      ],
    },
    {
      swahili: "nyumba",
      german: "Haus",
      partOfSpeech: "noun",
      nounClass: "N",
      examples: [
        { sw: "Nyumba yangu ni ndogo.", de: "Mein Haus ist klein." },
        { sw: "Tunakwenda nyumbani.", de: "Wir gehen nach Hause." },
      ],
    },
    {
      swahili: "kwenda",
      german: "gehen",
      partOfSpeech: "verb",
      examples: [
        { sw: "Ninakwenda sokoni.", de: "Ich gehe zum Markt." },
        { sw: "Anakwenda shule.", de: "Er/sie geht zur Schule." },
      ],
    },
    {
      swahili: "pesa",
      german: "Geld",
      partOfSpeech: "noun",
      nounClass: "N",
      examples: [
        { sw: "Sina pesa leo.", de: "Ich habe heute kein Geld." },
        { sw: "Pesa ngapi?", de: "Wie viel Geld?" },
      ],
    },
    {
      swahili: "leo",
      german: "heute",
      partOfSpeech: "adverb",
      examples: [
        { sw: "Leo ni Jumatatu.", de: "Heute ist Montag." },
        { sw: "Tutaonana leo.", de: "Wir sehen uns heute." },
      ],
    },
    {
      swahili: "jambo",
      german: "Hallo / Sache",
      partOfSpeech: "noun",
      nounClass: "Ji-Ma",
      examples: [
        { sw: "Jambo, rafiki!", de: "Hallo, Freund!" },
        { sw: "Hakuna jambo.", de: "Kein Problem." },
      ],
    },
  ];
  return base.map((b, i) => ({
    ...b,
    id: `seed-${i}`,
    box: 1,
    nextReview: now,
    createdAt: now - i * 1000,
  }));
}

export const dialogues: Dialogue[] = [
  // ============= ANFÄNGER =============
  {
    id: "greet",
    title: "Greetings",
    titleDe: "Begrüßung",
    emoji: "👋",
    turns: [
      { speaker: "A", sw: "Habari yako?", de: "Wie geht es dir?" },
      { speaker: "B", sw: "Nzuri, asante. Na wewe?", de: "Gut, danke. Und dir?" },
      { speaker: "A", sw: "Nzuri sana. Habari za asubuhi?", de: "Sehr gut. Wie war dein Morgen?" },
      {
        speaker: "B",
        sw: "Salama kabisa. Umelala vizuri?",
        de: "Alles ruhig. Hast du gut geschlafen?",
      },
      {
        speaker: "A",
        sw: "Ndiyo, nimelala vizuri sana, asante.",
        de: "Ja, ich habe sehr gut geschlafen, danke.",
      },
      { speaker: "B", sw: "Vizuri. Tuonane baadaye.", de: "Schön. Bis später." },
    ],
  },
  {
    id: "intro",
    title: "Introductions",
    titleDe: "Vorstellung",
    emoji: "🤝",
    turns: [
      { speaker: "A", sw: "Habari! Jina lako nani?", de: "Hallo! Wie heißt du?" },
      { speaker: "B", sw: "Jina langu ni Maria. Na wewe?", de: "Ich heiße Maria. Und du?" },
      {
        speaker: "A",
        sw: "Mimi ni Juma. Nimefurahi kukutana nawe.",
        de: "Ich bin Juma. Freut mich, dich kennenzulernen.",
      },
      { speaker: "B", sw: "Nami pia. Unatoka wapi?", de: "Mich auch. Woher kommst du?" },
      {
        speaker: "A",
        sw: "Natoka Ujerumani, lakini ninaishi Dar es Salaam sasa.",
        de: "Ich komme aus Deutschland, aber ich lebe jetzt in Dar es Salaam.",
      },
      { speaker: "B", sw: "Vizuri sana! Unafanya kazi gani?", de: "Sehr schön! Was arbeitest du?" },
      { speaker: "A", sw: "Mimi ni mwalimu wa lugha.", de: "Ich bin Sprachlehrer." },
    ],
  },
  {
    id: "market",
    title: "At the Market",
    titleDe: "Auf dem Markt",
    emoji: "🛒",
    turns: [
      {
        speaker: "A",
        sw: "Habari ya asubuhi. Bei gani embe moja?",
        de: "Guten Morgen. Was kostet eine Mango?",
      },
      {
        speaker: "B",
        sw: "Karibu! Embe moja ni shilingi mia tano.",
        de: "Willkommen! Eine Mango kostet fünfhundert Schilling.",
      },
      {
        speaker: "A",
        sw: "Ni ghali kidogo. Punguza bei tafadhali.",
        de: "Das ist etwas teuer. Senke bitte den Preis.",
      },
      {
        speaker: "B",
        sw: "Sawa, kwa sababu wewe ni mteja mzuri, mia nne.",
        de: "Okay, weil du ein guter Kunde bist, vierhundert.",
      },
      {
        speaker: "A",
        sw: "Nipe matano basi. Na ndizi pia, kilo moja.",
        de: "Dann gib mir fünf. Und Bananen auch, ein Kilo.",
      },
      {
        speaker: "B",
        sw: "Jumla ni shilingi elfu tatu.",
        de: "Insgesamt sind das dreitausend Schilling.",
      },
      { speaker: "A", sw: "Chukua. Asante sana.", de: "Bitte sehr. Vielen Dank." },
    ],
  },
  {
    id: "directions",
    title: "Asking Directions",
    titleDe: "Nach dem Weg fragen",
    emoji: "🗺️",
    turns: [
      {
        speaker: "A",
        sw: "Samahani, hospitali iko wapi?",
        de: "Entschuldigung, wo ist das Krankenhaus?",
      },
      {
        speaker: "B",
        sw: "Iko karibu. Nenda moja kwa moja mpaka kwenye taa za barabarani.",
        de: "Es ist in der Nähe. Geh geradeaus bis zur Ampel.",
      },
      { speaker: "A", sw: "Kisha nifanye nini?", de: "Und dann?" },
      {
        speaker: "B",
        sw: "Pinda kushoto, kisha utaona benki upande wa kulia.",
        de: "Bieg links ab, dann siehst du rechts eine Bank.",
      },
      { speaker: "A", sw: "Sawa, na hospitali?", de: "Okay, und das Krankenhaus?" },
      {
        speaker: "B",
        sw: "Hospitali iko nyuma ya benki, mita mia mbili tu.",
        de: "Das Krankenhaus ist hinter der Bank, nur zweihundert Meter.",
      },
      { speaker: "A", sw: "Asante sana kwa msaada.", de: "Vielen Dank für die Hilfe." },
    ],
  },
  {
    id: "restaurant",
    title: "At the Restaurant",
    titleDe: "Im Restaurant",
    emoji: "🍽️",
    turns: [
      {
        speaker: "A",
        sw: "Hodi! Kuna meza kwa watu wawili?",
        de: "Hallo! Gibt es einen Tisch für zwei?",
      },
      {
        speaker: "B",
        sw: "Karibuni. Tafadhali kaeni hapa. Naomba menyu.",
        de: "Willkommen. Bitte setzt euch hier. Hier ist die Speisekarte.",
      },
      {
        speaker: "A",
        sw: "Asante. Mnao wali na samaki leo?",
        de: "Danke. Habt ihr heute Reis mit Fisch?",
      },
      {
        speaker: "B",
        sw: "Ndiyo, tuna samaki wa kupaka, ni tamu sana.",
        de: "Ja, wir haben Fisch in Kokossoße, sehr lecker.",
      },
      {
        speaker: "C",
        sw: "Mimi nitachukua ugali na nyama choma, tafadhali.",
        de: "Ich nehme Ugali mit gegrilltem Fleisch, bitte.",
      },
      { speaker: "B", sw: "Sawa. Mnataka kunywa nini?", de: "Gut. Was möchtet ihr trinken?" },
      { speaker: "A", sw: "Maji ya chupa mawili, baridi.", de: "Zwei Flaschen Wasser, kalt." },
      {
        speaker: "B",
        sw: "Chakula kitakuja baada ya dakika kumi na tano.",
        de: "Das Essen kommt in fünfzehn Minuten.",
      },
    ],
  },
  {
    id: "taxi",
    title: "Taking a Taxi",
    titleDe: "Taxifahren",
    emoji: "🚕",
    turns: [
      { speaker: "A", sw: "Shikamoo! Unaenda mjini?", de: "Guten Tag! Fährst du in die Stadt?" },
      {
        speaker: "B",
        sw: "Marahaba. Ndiyo, unaenda wapi hasa?",
        de: "Grüß dich. Ja, wohin genau möchtest du?",
      },
      {
        speaker: "A",
        sw: "Nipeleke uwanja wa ndege, tafadhali.",
        de: "Bring mich zum Flughafen, bitte.",
      },
      {
        speaker: "B",
        sw: "Bei ni shilingi elfu kumi na tano.",
        de: "Der Preis ist fünfzehntausend Schilling.",
      },
      {
        speaker: "A",
        sw: "Ni nyingi. Elfu kumi inawezekana?",
        de: "Das ist viel. Sind zehntausend möglich?",
      },
      {
        speaker: "B",
        sw: "Sawa, kwa sababu trafiki si mbaya leo. Twende.",
        de: "Okay, weil der Verkehr heute nicht schlimm ist. Fahren wir.",
      },
      { speaker: "A", sw: "Tutafika kwa muda gani?", de: "Wie lange brauchen wir?" },
      {
        speaker: "B",
        sw: "Takriban nusu saa, kama hakuna foleni.",
        de: "Etwa eine halbe Stunde, wenn kein Stau ist.",
      },
    ],
  },
  {
    id: "hotel",
    title: "At the Hotel",
    titleDe: "Im Hotel",
    emoji: "🏨",
    turns: [
      {
        speaker: "A",
        sw: "Habari. Kuna chumba kwa usiku mbili?",
        de: "Hallo. Gibt es ein Zimmer für zwei Nächte?",
      },
      {
        speaker: "B",
        sw: "Karibu. Ndiyo, tunacho chumba cha kitanda kimoja na chumba cha vitanda viwili.",
        de: "Willkommen. Ja, wir haben ein Einzelzimmer und ein Doppelzimmer.",
      },
      { speaker: "A", sw: "Bei gani kwa usiku mmoja?", de: "Was kostet eine Nacht?" },
      {
        speaker: "B",
        sw: "Chumba cha kitanda kimoja ni dola arobaini, chakula cha asubuhi kimejumuishwa.",
        de: "Das Einzelzimmer kostet vierzig Dollar, Frühstück inklusive.",
      },
      { speaker: "A", sw: "Kuna intaneti chumbani?", de: "Gibt es Internet im Zimmer?" },
      {
        speaker: "B",
        sw: "Ndiyo, WiFi ni bure kwa wageni wote.",
        de: "Ja, WLAN ist für alle Gäste kostenlos.",
      },
      {
        speaker: "A",
        sw: "Vizuri. Nitachukua chumba hicho.",
        de: "Schön. Ich nehme dieses Zimmer.",
      },
      {
        speaker: "B",
        sw: "Naomba pasipoti yako kwa usajili.",
        de: "Ich brauche deinen Pass für die Anmeldung.",
      },
    ],
  },
  {
    id: "numbers",
    title: "Numbers & Counting",
    titleDe: "Zahlen",
    emoji: "🔢",
    turns: [
      {
        speaker: "A",
        sw: "Tujifunze namba. Moja, mbili, tatu, nne, tano.",
        de: "Lernen wir Zahlen. Eins, zwei, drei, vier, fünf.",
      },
      { speaker: "B", sw: "Sita, saba, nane, tisa, kumi.", de: "Sechs, sieben, acht, neun, zehn." },
      {
        speaker: "A",
        sw: "Na sasa makumi: ishirini, thelathini, arobaini.",
        de: "Und jetzt die Zehner: zwanzig, dreißig, vierzig.",
      },
      {
        speaker: "B",
        sw: "Hamsini, sitini, sabini, themanini, tisini, mia moja.",
        de: "Fünfzig, sechzig, siebzig, achtzig, neunzig, hundert.",
      },
      { speaker: "A", sw: "Una umri gani?", de: "Wie alt bist du?" },
      {
        speaker: "B",
        sw: "Nina miaka thelathini na tano.",
        de: "Ich bin fünfunddreißig Jahre alt.",
      },
    ],
  },
  {
    id: "family",
    title: "Family",
    titleDe: "Familie",
    emoji: "👨‍👩‍👧",
    turns: [
      { speaker: "A", sw: "Una watoto wangapi?", de: "Wie viele Kinder hast du?" },
      {
        speaker: "B",
        sw: "Nina watoto wawili, msichana na mvulana.",
        de: "Ich habe zwei Kinder, ein Mädchen und einen Jungen.",
      },
      { speaker: "A", sw: "Wana umri gani?", de: "Wie alt sind sie?" },
      {
        speaker: "B",
        sw: "Msichana ana miaka saba, mvulana ana miaka mitano.",
        de: "Das Mädchen ist sieben, der Junge fünf.",
      },
      { speaker: "A", sw: "Wanasoma shule?", de: "Gehen sie zur Schule?" },
      {
        speaker: "B",
        sw: "Ndiyo, wote wawili wanasoma shule ya msingi karibu na nyumbani.",
        de: "Ja, beide gehen in die Grundschule nahe unserem Haus.",
      },
      { speaker: "A", sw: "Familia yako ni nzuri sana.", de: "Deine Familie ist sehr schön." },
    ],
  },
  {
    id: "emergency",
    title: "Emergencies",
    titleDe: "Notfälle",
    emoji: "🚨",
    turns: [
      {
        speaker: "A",
        sw: "Nisaidie tafadhali! Kuna ajali!",
        de: "Hilf mir bitte! Es gab einen Unfall!",
      },
      { speaker: "B", sw: "Tulia. Una shida gani hasa?", de: "Ruhig. Was genau ist passiert?" },
      {
        speaker: "A",
        sw: "Rafiki yangu ameanguka na anaumwa kichwa.",
        de: "Mein Freund ist gestürzt und hat Kopfschmerzen.",
      },
      { speaker: "B", sw: "Anaweza kuongea?", de: "Kann er sprechen?" },
      {
        speaker: "A",
        sw: "Ndiyo, lakini kwa shida. Naomba uite ambulensi.",
        de: "Ja, aber mühsam. Bitte ruf einen Krankenwagen.",
      },
      {
        speaker: "B",
        sw: "Nimepiga simu. Watafika ndani ya dakika tano. Mko wapi?",
        de: "Ich habe angerufen. Sie sind in fünf Minuten da. Wo seid ihr?",
      },
      {
        speaker: "A",
        sw: "Tuko mbele ya duka kubwa, karibu na kituo cha basi.",
        de: "Wir sind vor dem Supermarkt, nahe der Bushaltestelle.",
      },
    ],
  },

  // ============= MITTELSTUFE =============
  {
    id: "doctor",
    title: "Doctor's Visit",
    titleDe: "Beim Arzt",
    emoji: "🩺",
    level: "intermediate",
    turns: [
      {
        speaker: "A",
        sw: "Daktari, sijisikii vizuri tangu jana usiku.",
        de: "Doktor, mir geht es seit gestern Abend nicht gut.",
      },
      { speaker: "B", sw: "Una dalili gani hasa?", de: "Welche Symptome hast du genau?" },
      {
        speaker: "A",
        sw: "Nina homa, kichwa kinauma na sina hamu ya kula.",
        de: "Ich habe Fieber, Kopfschmerzen und keinen Appetit.",
      },
      {
        speaker: "B",
        sw: "Hebu nikupime joto. ... Joto lako ni digrii thelathini na tisa.",
        de: "Lass mich Fieber messen. ... Deine Temperatur ist 39 Grad.",
      },
      { speaker: "A", sw: "Ni mbaya?", de: "Ist das schlimm?" },
      {
        speaker: "B",
        sw: "Si mbaya sana, lakini lazima upumzike. Nakuandikia dawa.",
        de: "Nicht sehr schlimm, aber du musst dich ausruhen. Ich verschreibe dir Medikamente.",
      },
      {
        speaker: "A",
        sw: "Nichukue mara ngapi kwa siku?",
        de: "Wie oft am Tag soll ich sie nehmen?",
      },
      {
        speaker: "B",
        sw: "Mara tatu, baada ya chakula. Na unywe maji mengi.",
        de: "Dreimal, nach dem Essen. Und trink viel Wasser.",
      },
      { speaker: "A", sw: "Sawa daktari, asante sana.", de: "In Ordnung, Doktor, vielen Dank." },
    ],
  },
  {
    id: "work_meeting",
    title: "Work Meeting",
    titleDe: "Arbeitsbesprechung",
    emoji: "💼",
    level: "intermediate",
    turns: [
      {
        speaker: "A",
        sw: "Habari za kazi? Tuanze mkutano wetu.",
        de: "Wie läuft die Arbeit? Beginnen wir unser Meeting.",
      },
      {
        speaker: "B",
        sw: "Karibuni wote. Leo tutazungumzia mradi mpya wa wateja.",
        de: "Willkommen alle. Heute sprechen wir über das neue Kundenprojekt.",
      },
      {
        speaker: "C",
        sw: "Nina swali kuhusu bajeti. Imeongezeka au imepungua?",
        de: "Ich habe eine Frage zum Budget. Wurde es erhöht oder gekürzt?",
      },
      {
        speaker: "B",
        sw: "Bajeti imeongezeka kwa asilimia kumi mwezi huu.",
        de: "Das Budget wurde diesen Monat um zehn Prozent erhöht.",
      },
      {
        speaker: "A",
        sw: "Habari njema. Tunaweza kuajiri watu wengine?",
        de: "Gute Nachrichten. Können wir weitere Leute einstellen?",
      },
      {
        speaker: "B",
        sw: "Ndiyo, tunahitaji mtaalamu mmoja wa programu na mbunifu.",
        de: "Ja, wir brauchen einen Programmierer und einen Designer.",
      },
      { speaker: "C", sw: "Lini tutaanza kuwatafuta?", de: "Wann beginnen wir mit der Suche?" },
      {
        speaker: "A",
        sw: "Wiki ijayo. Tafadhali andaeni matangazo ya kazi kabla ya Ijumaa.",
        de: "Nächste Woche. Bitte bereitet die Stellenanzeigen vor Freitag vor.",
      },
      {
        speaker: "B",
        sw: "Sawa. Tukutane tena Jumatatu kuangalia maendeleo.",
        de: "Gut. Treffen wir uns Montag wieder, um den Fortschritt zu prüfen.",
      },
    ],
  },
  {
    id: "phone_call",
    title: "Phone Call",
    titleDe: "Telefongespräch",
    emoji: "📞",
    level: "intermediate",
    turns: [
      {
        speaker: "A",
        sw: "Halo, naomba kuongea na Bwana Mwangi.",
        de: "Hallo, ich möchte bitte Herrn Mwangi sprechen.",
      },
      {
        speaker: "B",
        sw: "Samahani, hayupo ofisini sasa hivi. Yuko kwenye mkutano.",
        de: "Entschuldigung, er ist gerade nicht im Büro. Er ist in einer Besprechung.",
      },
      { speaker: "A", sw: "Atarudi lini?", de: "Wann kommt er zurück?" },
      {
        speaker: "B",
        sw: "Takriban saa nane mchana. Naweza kukusaidia?",
        de: "Etwa um zwei Uhr nachmittags. Kann ich Ihnen helfen?",
      },
      {
        speaker: "A",
        sw: "Ningependa kupanga miadi naye wiki ijayo.",
        de: "Ich würde gern einen Termin mit ihm für nächste Woche vereinbaren.",
      },
      {
        speaker: "B",
        sw: "Sawa. Jina lako ni nani na simu yako ni ipi?",
        de: "Gut. Wie ist Ihr Name und Ihre Telefonnummer?",
      },
      {
        speaker: "A",
        sw: "Jina langu ni Anna Schmidt, simu yangu ni sufuri saba moja mbili...",
        de: "Mein Name ist Anna Schmidt, meine Nummer ist 0712...",
      },
      {
        speaker: "B",
        sw: "Nimepokea. Atakupigia simu mara atakaporudi.",
        de: "Verstanden. Er ruft Sie zurück, sobald er zurück ist.",
      },
      { speaker: "A", sw: "Asante sana kwa msaada wako.", de: "Vielen Dank für Ihre Hilfe." },
    ],
  },
  {
    id: "weekend_plans",
    title: "Weekend Plans",
    titleDe: "Wochenendpläne",
    emoji: "🎉",
    level: "intermediate",
    turns: [
      {
        speaker: "A",
        sw: "Una mpango gani kwa wikendi?",
        de: "Was hast du fürs Wochenende geplant?",
      },
      {
        speaker: "B",
        sw: "Sijaamua bado. Pengine nitaenda pwani kupumzika.",
        de: "Ich habe mich noch nicht entschieden. Vielleicht fahre ich zum Strand zum Entspannen.",
      },
      {
        speaker: "C",
        sw: "Wazo zuri! Tunaweza kwenda pamoja?",
        de: "Gute Idee! Können wir zusammen gehen?",
      },
      { speaker: "B", sw: "Bila shaka. Tutachukua gari langu.", de: "Klar. Wir nehmen mein Auto." },
      {
        speaker: "A",
        sw: "Mimi nitaleta chakula na vinywaji.",
        de: "Ich bringe Essen und Getränke mit.",
      },
      {
        speaker: "C",
        sw: "Vizuri. Tutaondoka saa ngapi Jumamosi?",
        de: "Schön. Wann fahren wir am Samstag los?",
      },
      {
        speaker: "B",
        sw: "Tukutane saa moja asubuhi nyumbani kwangu.",
        de: "Treffen wir uns um sieben Uhr morgens bei mir.",
      },
      {
        speaker: "A",
        sw: "Sawa. Tusisahau kuleta miwani ya jua na mafuta ya kuoga jua.",
        de: "Gut. Vergessen wir nicht Sonnenbrillen und Sonnencreme.",
      },
    ],
  },
  {
    id: "bank",
    title: "At the Bank",
    titleDe: "Bei der Bank",
    emoji: "🏦",
    level: "intermediate",
    turns: [
      {
        speaker: "A",
        sw: "Habari. Ningependa kufungua akaunti mpya.",
        de: "Hallo. Ich möchte ein neues Konto eröffnen.",
      },
      {
        speaker: "B",
        sw: "Karibu. Ni aina gani ya akaunti unayotaka?",
        de: "Willkommen. Welche Art Konto möchten Sie?",
      },
      {
        speaker: "A",
        sw: "Akaunti ya akiba, tafadhali. Riba yake ni kiasi gani?",
        de: "Ein Sparkonto, bitte. Wie hoch ist der Zinssatz?",
      },
      {
        speaker: "B",
        sw: "Tunatoa asilimia nne kwa mwaka.",
        de: "Wir bieten vier Prozent pro Jahr.",
      },
      {
        speaker: "A",
        sw: "Inafaa. Nahitaji nyaraka zipi?",
        de: "Passt. Welche Unterlagen brauche ich?",
      },
      {
        speaker: "B",
        sw: "Pasipoti, anwani ya makazi na pesa za awali, dola hamsini angalau.",
        de: "Pass, Wohnadresse und eine Ersteinlage, mindestens fünfzig Dollar.",
      },
      {
        speaker: "A",
        sw: "Naweza kupata kadi ya benki leo?",
        de: "Bekomme ich die Bankkarte heute?",
      },
      {
        speaker: "B",
        sw: "Hapana, itachukua siku saba kupata kwa posta.",
        de: "Nein, sie kommt in sieben Tagen per Post.",
      },
    ],
  },

  // ============= FORTGESCHRITTEN =============
  {
    id: "job_interview",
    title: "Job Interview",
    titleDe: "Vorstellungsgespräch",
    emoji: "🎯",
    level: "advanced",
    turns: [
      {
        speaker: "A",
        sw: "Karibu kwenye mahojiano. Tafadhali jitambulishe kwa kifupi.",
        de: "Willkommen zum Gespräch. Bitte stellen Sie sich kurz vor.",
      },
      {
        speaker: "B",
        sw: "Asante kwa fursa hii. Jina langu ni Hassan, nina uzoefu wa miaka saba katika uongozi wa miradi.",
        de: "Danke für diese Gelegenheit. Mein Name ist Hassan, ich habe sieben Jahre Erfahrung im Projektmanagement.",
      },
      {
        speaker: "A",
        sw: "Kwa nini unataka kujiunga na kampuni yetu?",
        de: "Warum möchten Sie zu unserem Unternehmen kommen?",
      },
      {
        speaker: "B",
        sw: "Maono yenu kuhusu uvumbuzi na maendeleo endelevu yananivutia sana.",
        de: "Ihre Vision von Innovation und nachhaltiger Entwicklung spricht mich sehr an.",
      },
      {
        speaker: "C",
        sw: "Unaweza kutueleza changamoto kubwa uliyowahi kukabiliana nayo kazini?",
        de: "Können Sie uns von einer großen Herausforderung erzählen, der Sie sich beruflich gestellt haben?",
      },
      {
        speaker: "B",
        sw: "Mara moja tulipoteza mteja mkubwa. Niliongoza timu kubuni mkakati mpya, na ndani ya miezi sita tulipata wateja watatu wakubwa zaidi.",
        de: "Einmal verloren wir einen Großkunden. Ich führte das Team bei einer neuen Strategie, und in sechs Monaten gewannen wir drei größere Kunden.",
      },
      {
        speaker: "A",
        sw: "Vizuri. Una matarajio gani ya mshahara?",
        de: "Sehr gut. Welche Gehaltsvorstellungen haben Sie?",
      },
      {
        speaker: "B",
        sw: "Ningependa kujadili hilo baada ya kuelewa kabisa majukumu yote.",
        de: "Das würde ich gern besprechen, nachdem ich alle Aufgaben vollständig verstanden habe.",
      },
      {
        speaker: "C",
        sw: "Jibu zuri. Tutawasiliana nawe ndani ya wiki mbili.",
        de: "Gute Antwort. Wir melden uns innerhalb von zwei Wochen bei Ihnen.",
      },
    ],
  },
  {
    id: "politics_debate",
    title: "Discussing Politics",
    titleDe: "Politik diskutieren",
    emoji: "🗳️",
    level: "advanced",
    turns: [
      {
        speaker: "A",
        sw: "Umesoma habari za uchaguzi ujao?",
        de: "Hast du die Nachrichten zur kommenden Wahl gelesen?",
      },
      {
        speaker: "B",
        sw: "Ndiyo. Naona wagombea wengi wanaahidi mambo yasiyowezekana.",
        de: "Ja. Ich finde, viele Kandidaten versprechen unmögliche Dinge.",
      },
      {
        speaker: "C",
        sw: "Ninakubaliana. Tatizo kubwa ni ukosefu wa uwazi katika sera zao.",
        de: "Ich stimme zu. Das große Problem ist die mangelnde Transparenz in ihren Programmen.",
      },
      {
        speaker: "A",
        sw: "Lakini lazima tukubali kwamba baadhi yao wameleta mabadiliko ya kweli.",
        de: "Aber wir müssen anerkennen, dass einige echte Veränderungen gebracht haben.",
      },
      {
        speaker: "B",
        sw: "Kweli, hasa katika sekta ya elimu na afya.",
        de: "Stimmt, besonders im Bildungs- und Gesundheitswesen.",
      },
      {
        speaker: "C",
        sw: "Hata hivyo, rushwa bado ni kikwazo kikubwa kwa maendeleo.",
        de: "Trotzdem bleibt Korruption ein großes Hindernis für die Entwicklung.",
      },
      {
        speaker: "A",
        sw: "Suluhisho ni vijana kushiriki zaidi katika siasa.",
        de: "Die Lösung ist, dass junge Leute sich stärker in der Politik engagieren.",
      },
      {
        speaker: "B",
        sw: "Nakubali. Sauti za vijana zinapaswa kusikika kwenye maamuzi muhimu.",
        de: "Einverstanden. Die Stimmen der Jugend müssen bei wichtigen Entscheidungen gehört werden.",
      },
    ],
  },
  {
    id: "renting_apartment",
    title: "Renting an Apartment",
    titleDe: "Wohnung mieten",
    emoji: "🔑",
    level: "advanced",
    turns: [
      {
        speaker: "A",
        sw: "Nimeona tangazo lako mtandaoni kuhusu nyumba ya kupanga.",
        de: "Ich habe Ihre Online-Anzeige zur Mietwohnung gesehen.",
      },
      {
        speaker: "B",
        sw: "Karibu. Ndiyo, bado ipo. Una maswali gani?",
        de: "Willkommen. Ja, sie ist noch verfügbar. Welche Fragen haben Sie?",
      },
      {
        speaker: "A",
        sw: "Kodi ya mwezi imejumuisha maji na umeme?",
        de: "Ist die Monatsmiete inklusive Wasser und Strom?",
      },
      {
        speaker: "B",
        sw: "Maji yamejumuishwa, lakini umeme unalipa tofauti kulingana na matumizi.",
        de: "Wasser ist inklusive, aber Strom zahlen Sie separat nach Verbrauch.",
      },
      {
        speaker: "A",
        sw: "Mkataba ni wa muda gani na kuna dhamana?",
        de: "Wie lang läuft der Vertrag und gibt es eine Kaution?",
      },
      {
        speaker: "B",
        sw: "Mkataba ni wa mwaka mmoja, na dhamana ni kodi ya miezi miwili.",
        de: "Der Vertrag läuft ein Jahr, die Kaution beträgt zwei Monatsmieten.",
      },
      {
        speaker: "A",
        sw: "Je, naruhusiwa kubadilisha rangi za kuta au kuweka samani zangu?",
        de: "Darf ich die Wandfarben ändern oder eigene Möbel reinstellen?",
      },
      {
        speaker: "B",
        sw: "Samani zako ni sawa. Kwa rangi, lazima upate idhini ya maandishi kutoka kwangu.",
        de: "Eigene Möbel sind in Ordnung. Für Farben brauchen Sie meine schriftliche Genehmigung.",
      },
      {
        speaker: "A",
        sw: "Nakubaliana na masharti. Tunaweza kukutana kesho kusaini?",
        de: "Ich bin mit den Bedingungen einverstanden. Können wir uns morgen zum Unterschreiben treffen?",
      },
      {
        speaker: "B",
        sw: "Sawa kabisa. Tukutane saa nne asubuhi katika ofisi yangu.",
        de: "Bestens. Treffen wir uns um zehn Uhr morgens in meinem Büro.",
      },
    ],
  },
  {
    id: "environment",
    title: "Environment & Climate",
    titleDe: "Umwelt & Klima",
    emoji: "🌍",
    level: "advanced",
    turns: [
      {
        speaker: "A",
        sw: "Mabadiliko ya tabianchi yanaathiri sana kilimo nchini mwetu.",
        de: "Der Klimawandel beeinflusst die Landwirtschaft in unserem Land stark.",
      },
      {
        speaker: "B",
        sw: "Kweli, mvua zimekuwa zisizotabirika na ukame umeongezeka.",
        de: "Wahr, die Regenfälle sind unberechenbar geworden und die Dürren nehmen zu.",
      },
      {
        speaker: "C",
        sw: "Wakulima wadogo ndio wanaoumia zaidi kwa sababu hawana akiba.",
        de: "Kleinbauern leiden am meisten, weil sie keine Reserven haben.",
      },
      {
        speaker: "A",
        sw: "Serikali inapaswa kuwekeza katika mbinu za umwagiliaji wa kisasa.",
        de: "Die Regierung sollte in moderne Bewässerungsmethoden investieren.",
      },
      {
        speaker: "B",
        sw: "Sambamba na hilo, lazima tupande miti kuzuia mmomonyoko wa udongo.",
        de: "Parallel dazu müssen wir Bäume pflanzen, um Bodenerosion zu verhindern.",
      },
      {
        speaker: "C",
        sw: "Elimu ya mazingira shuleni pia ni muhimu sana kwa kizazi kijacho.",
        de: "Umweltbildung in Schulen ist ebenfalls sehr wichtig für die nächste Generation.",
      },
      {
        speaker: "A",
        sw: "Tukishirikiana, tunaweza kupunguza athari mbaya kwa kiasi kikubwa.",
        de: "Wenn wir zusammenarbeiten, können wir die negativen Auswirkungen deutlich reduzieren.",
      },
      {
        speaker: "B",
        sw: "Tumaini langu ni kwamba sera mpya zitatekelezwa kabla haijachelewa.",
        de: "Meine Hoffnung ist, dass neue Maßnahmen umgesetzt werden, bevor es zu spät ist.",
      },
    ],
  },
  {
    id: "storytelling",
    title: "Sharing a Story",
    titleDe: "Eine Geschichte erzählen",
    emoji: "📖",
    level: "advanced",
    turns: [
      {
        speaker: "A",
        sw: "Jana nilipata uzoefu wa ajabu sana sokoni.",
        de: "Gestern hatte ich auf dem Markt ein sehr seltsames Erlebnis.",
      },
      {
        speaker: "B",
        sw: "Niambie, nimekuwa nikingoja hadithi nzuri tangu asubuhi.",
        de: "Erzähl, ich warte schon seit dem Morgen auf eine gute Geschichte.",
      },
      {
        speaker: "A",
        sw: "Nilikuwa ninanunua matunda wakati mzee mmoja alinikaribia akiniita kwa jina langu.",
        de: "Ich kaufte gerade Obst, als ein alter Mann auf mich zukam und mich beim Namen rief.",
      },
      { speaker: "B", sw: "Ulimjua?", de: "Kanntest du ihn?" },
      {
        speaker: "A",
        sw: "Hapana, hata kidogo. Aliniambia ananijua tangu nilipokuwa mtoto mdogo kijijini.",
        de: "Nein, überhaupt nicht. Er sagte, er kenne mich, seit ich klein im Dorf war.",
      },
      {
        speaker: "B",
        sw: "Inashangaza! Aliendelea kusema nini?",
        de: "Erstaunlich! Was sagte er weiter?",
      },
      {
        speaker: "A",
        sw: "Alielezea kumbukumbu za baba yangu kwa undani sana, mambo ambayo hata mimi sikujua.",
        de: "Er beschrieb Erinnerungen an meinen Vater sehr detailliert, Dinge, die selbst ich nicht wusste.",
      },
      {
        speaker: "B",
        sw: "Pengine alikuwa rafiki wa zamani wa familia.",
        de: "Vielleicht war er ein alter Freund der Familie.",
      },
      {
        speaker: "A",
        sw: "Ndivyo nilivyofikiri. Tuliongea kwa muda mrefu na alinipa picha ya zamani ya baba.",
        de: "Genau das dachte ich. Wir unterhielten uns lange und er gab mir ein altes Foto meines Vaters.",
      },
      {
        speaker: "B",
        sw: "Hii ni hadithi ya kugusa moyo. Lazima umtafute tena.",
        de: "Das ist eine bewegende Geschichte. Du musst ihn wiederfinden.",
      },
    ],
  },
];

export const nounClasses: NounClassInfo[] = [
  {
    id: "M-Wa",
    name: "M-/Wa- (Menschen)",
    singular: "m-",
    plural: "wa-",
    meaning: "Personen, Lebewesen",
    subjectPrefix: { sg: "a-", pl: "wa-" },
    objectPrefix: { sg: "-m-", pl: "-wa-" },
    genitive: { sg: "wa", pl: "wa" },
    demonstratives: {
      near: { sg: "huyu", pl: "hawa" },
      far: { sg: "yule", pl: "wale" },
    },
    examples: [
      { sw: "mtu / watu", de: "Mensch / Menschen" },
      { sw: "mtoto / watoto", de: "Kind / Kinder" },
      { sw: "mwalimu / walimu", de: "Lehrer / Lehrer (pl)" },
      { sw: "mgeni / wageni", de: "Gast / Gäste" },
    ],
  },
  {
    id: "M-Mi",
    name: "M-/Mi- (Pflanzen, Dinge)",
    singular: "m-",
    plural: "mi-",
    meaning: "Pflanzen, längliche Dinge",
    subjectPrefix: { sg: "u-", pl: "i-" },
    objectPrefix: { sg: "-u-", pl: "-i-" },
    genitive: { sg: "wa", pl: "ya" },
    demonstratives: {
      near: { sg: "huu", pl: "hii" },
      far: { sg: "ule", pl: "ile" },
    },
    examples: [
      { sw: "mti / miti", de: "Baum / Bäume" },
      { sw: "mji / miji", de: "Stadt / Städte" },
      { sw: "mkono / mikono", de: "Hand / Hände" },
      { sw: "mlango / milango", de: "Tür / Türen" },
    ],
  },
  {
    id: "Ki-Vi",
    name: "Ki-/Vi- (Dinge)",
    singular: "ki-",
    plural: "vi-",
    meaning: "Gegenstände, Werkzeuge",
    subjectPrefix: { sg: "ki-", pl: "vi-" },
    objectPrefix: { sg: "-ki-", pl: "-vi-" },
    genitive: { sg: "cha", pl: "vya" },
    demonstratives: {
      near: { sg: "hiki", pl: "hivi" },
      far: { sg: "kile", pl: "vile" },
    },
    examples: [
      { sw: "kitabu / vitabu", de: "Buch / Bücher" },
      { sw: "kiti / viti", de: "Stuhl / Stühle" },
      { sw: "kitu / vitu", de: "Ding / Dinge" },
      { sw: "kisu / visu", de: "Messer" },
    ],
  },
  {
    id: "N",
    name: "N- (Tiere, Abstrakta)",
    singular: "n-/—",
    plural: "n-/—",
    meaning: "Tiere, Lehnwörter, Abstrakta",
    subjectPrefix: { sg: "i-", pl: "zi-" },
    objectPrefix: { sg: "-i-", pl: "-zi-" },
    genitive: { sg: "ya", pl: "za" },
    demonstratives: {
      near: { sg: "hii", pl: "hizi" },
      far: { sg: "ile", pl: "zile" },
    },
    examples: [
      { sw: "nyumba / nyumba", de: "Haus / Häuser" },
      { sw: "habari / habari", de: "Nachricht" },
      { sw: "ndege / ndege", de: "Vogel / Flugzeug" },
      { sw: "rafiki / marafiki", de: "Freund / Freunde" },
    ],
  },
  {
    id: "Ji-Ma",
    name: "Ji-/Ma- (Größe, Paare)",
    singular: "(ji-)",
    plural: "ma-",
    meaning: "Augmentativ, Paare, Flüssigkeiten",
    subjectPrefix: { sg: "li-", pl: "ya-" },
    objectPrefix: { sg: "-li-", pl: "-ya-" },
    genitive: { sg: "la", pl: "ya" },
    demonstratives: {
      near: { sg: "hili", pl: "haya" },
      far: { sg: "lile", pl: "yale" },
    },
    examples: [
      { sw: "jicho / macho", de: "Auge / Augen" },
      { sw: "jina / majina", de: "Name / Namen" },
      { sw: "yai / mayai", de: "Ei / Eier" },
      { sw: "maji", de: "Wasser" },
    ],
  },
  {
    id: "U",
    name: "U- (Abstrakta)",
    singular: "u-",
    plural: "(N- oder Ma-)",
    meaning: "Abstrakte Begriffe, Materialien",
    subjectPrefix: { sg: "u-", pl: "zi-" },
    objectPrefix: { sg: "-u-", pl: "-zi-" },
    genitive: { sg: "wa", pl: "za" },
    demonstratives: {
      near: { sg: "huu", pl: "—" },
      far: { sg: "ule", pl: "—" },
    },
    examples: [
      { sw: "uhuru", de: "Freiheit" },
      { sw: "upendo", de: "Liebe" },
      { sw: "ufunguo / funguo", de: "Schlüssel" },
      { sw: "uso / nyuso", de: "Gesicht / Gesichter" },
    ],
  },
  {
    id: "Pa-Ku-Mu",
    name: "Pa-/Ku-/Mu- (Orte)",
    singular: "—",
    plural: "—",
    meaning: "Orte (definit / unbestimmt / innerhalb)",
    subjectPrefix: { sg: "pa-/ku-/m-", pl: "—" },
    objectPrefix: { sg: "-pa-/-ku-/-m-", pl: "—" },
    genitive: { sg: "pa / kwa / mwa", pl: "—" },
    demonstratives: {
      near: { sg: "hapa / huku / humu", pl: "—" },
      far: { sg: "pale / kule / mle", pl: "—" },
    },
    examples: [
      { sw: "mahali", de: "Ort, Platz" },
      { sw: "nyumbani", de: "zu Hause" },
      { sw: "shuleni", de: "in der Schule" },
      { sw: "sokoni", de: "auf dem Markt" },
    ],
  },
  {
    id: "Ku",
    name: "Ku- (Infinitive)",
    singular: "ku-",
    plural: "—",
    meaning: "Verbalnomen / Infinitiv",
    subjectPrefix: { sg: "ku-", pl: "—" },
    objectPrefix: { sg: "-ku-", pl: "—" },
    genitive: { sg: "kwa", pl: "—" },
    demonstratives: {
      near: { sg: "huku", pl: "—" },
      far: { sg: "kule", pl: "—" },
    },
    examples: [
      { sw: "kusoma", de: "lesen / Lesen" },
      { sw: "kula", de: "essen" },
      { sw: "kucheza", de: "spielen / tanzen" },
      { sw: "kufanya kazi", de: "arbeiten" },
    ],
  },
];

/** Einsilbige Swahili-Verben (Stamm = eine Silbe). Behalten in den meisten
 * Zeiten das `ku-` als Betonungsträger. */
const MONOSYLLABIC_VERBS = new Set([
  "kula",
  "kunywa",
  "kuja",
  "kufa",
  "kupa",
  "kuwa",
  "kunya",
  "kwenda",
  "kuisha",
  "kuchwa",
]);

export function isMonosyllabicVerb(swahili: string): boolean {
  return MONOSYLLABIC_VERBS.has(swahili.trim().toLowerCase());
}

export const monosyllabicVerbsInfo = {
  verbs: ["kula", "kunywa", "kuja", "kufa", "kupa", "kuwa", "kunya", "kwenda"],
  withKu: [
    { sw: "ninakula", de: "ich esse" },
    { sw: "tutakunywa", de: "wir werden trinken" },
    { sw: "amekuja", de: "er/sie ist gekommen" },
    { sw: "angekuwa", de: "er/sie wäre" },
  ],
  withoutKu: [
    { sw: "la!", de: "iss! (Imperativ Sg.)" },
    { sw: "hula chakula", de: "er/sie isst (gewohnheitsmäßig)" },
    { sw: "hali nyama", de: "er/sie isst kein Fleisch (Negativ-Präsens)" },
    { sw: "njoo!", de: "komm! (Imperativ — Suppletivform von kuja)" },
  ],
};

export const phraseOfDay: { sw: string; de: string }[] = [
  {
    sw: "Haba na haba hujaza kibaba.",
    de: "Kleinvieh macht auch Mist (wörtl.: Kleines füllt das Maß).",
  },
  { sw: "Pole pole ndio mwendo.", de: "Langsam langsam ist der Weg." },
  { sw: "Hakuna matata.", de: "Kein Problem." },
  { sw: "Mgeni njoo, mwenyeji apone.", de: "Komm Gast, der Gastgeber wird gestärkt." },
  {
    sw: "Asiyefunzwa na mamaye hufunzwa na ulimwengu.",
    de: "Wer nicht von der Mutter lernt, lernt von der Welt.",
  },
  { sw: "Penye nia pana njia.", de: "Wo ein Wille ist, ist ein Weg." },
  { sw: "Subira huvuta heri.", de: "Geduld bringt Glück." },
];
