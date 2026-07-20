# Vokabel-Review (Juli 2026)

> **Nachtrag (2. Runde):** Aus dem Kiswahili-Deutsch-Wörterbuch-Scan (6 Seiten,
> S. 292–297) wurden alle ~740 Einträge transkribiert und mit dem Pool
> abgeglichen. **180 fehlende Vokabeln wurden ergänzt** (jeweils mit zwei
> Beispielsätzen, Singular/Plural) — darunter überraschende Lücken wie *meza*
> (Tisch), *tafadhali* (bitte), *samahani*, *Januari*, *Jumanne* (Dienstag),
> *nyeupe* (weiß), die Grundzahlen (*moja, mbili, nne, sabini, laki*), alle
> Personalpronomen und die Grußkultur (*shikamoo, marahaba, pole, hodi,
> kwaheri*). Schreibvarianten des Wörterbuchs wurden NICHT doppelt angelegt
> (z. B. arusi=harusi, ba(i)skeli=baisikeli, Disemba=Desemba, serekali=serikali,
> tiketi=tikiti, sufuri=sifuri, dogo=mdogo, pya=mpya, salimia=kusalimu,
> muhindi=mahindi, ukucha=kucha). Der Pool ist jetzt alphabetisch sortiert und
> enthält 1197 Einträge; das versehentliche `kwenda`-Duplikat (aus der
> kenda-Korrektur) wurde dabei entfernt. Für Supabase liegt
> `scripts/add-vocab-2026-07.sql` (180 INSERTs) bereit — nach
> `fix-grammar-2026-07.sql` ausführen.

Anlass war das Feedback zu Grammatikfehlern in den Beispielsätzen (z. B.
*marafiki wangu* statt korrekt **marafiki zangu**). Alle 1018 Einträge des
Pools (`public/vocab-pool.json`, 2026 Beispielsätze) sowie die Seed-Vokabeln
und Dialoge in `src/lib/seed.ts` wurden Satz für Satz geprüft.

**Ergebnis: 266 Pool-Einträge korrigiert** (Beispielsätze, Nomenklassen,
einzelne Stichwörter und deutsche Glossen) plus 3 Stellen in `seed.ts`.

## Wichtig: Supabase ist die Datenquelle

`public/vocab-pool.json` wird per `scripts/pool-from-csv.mjs` aus einem Export
der Supabase-Tabelle `shared_vocab` erzeugt. Damit die Korrekturen beim
nächsten Export nicht überschrieben werden, liegt unter
**`scripts/fix-grammar-2026-07.sql`** ein Skript mit 266 UPDATE-Statements,
das im Supabase-SQL-Editor ausgeführt werden sollte (WHERE-Klausel nutzt
jeweils das alte Stichwort, läuft in einer Transaktion).

## Korrektur-Kategorien

### 1. Possessiv-Konkordanz bei Beziehungswörtern (das gemeldete Problem)

Verwandtschafts- und Beziehungswörter nehmen im Standard-Swahili die
N-Klassen-Possessive (yangu/zangu), auch wenn sie Personen bezeichnen:

- *Marafiki wangu wapo hapa* → **Marafiki zangu wapo hapa** (auch in seed.ts)
- *Jirani wetu wanasaidia…* → **Majirani zetu wanasaidia wakati wa shida**
- *Binti wangu / Binti wake* → **Binti yangu / Binti yake**

### 2. Falsche Klassen-Konkordanz in Sätzen

z. B. *Chandarua linasaidia* → **kinasaidia** (Ki-Vi), *Gari ilisimama* →
**lilisimama** (Ji-Ma), *Injinia yetu* → **Injinia wetu** (belebt),
*Kioo cha dirisha limevunjika* → **kimevunjika**, *Sebule letu lina* →
**Sebule yetu ina**, *Supamaketi umefunguliwa* → **imefunguliwa**,
*Manukato … ina* → **yana**, *Tumeona nyoka kubwa* → **nyoka mkubwa**,
*Gauni nyekundu* → **Gauni jekundu**, *Habari ya juzi hazikuwa* →
**Habari za juzi hazikuwa**, *omleti la mayai* → **omleti ya mayai**,
*Tofaa nyekundu ni tamu* → **Matofaa mekundu ni matamu** u. v. m.

### 3. Fehlende Lokativ-/Präpositionsmarkierung

Ortsangaben brauchen -ni, kwenye oder katika: *Hatufanyi kazi baa* →
**kwenye baa**, *Weka maziwa friji* → **kwenye friji**, *anafanya kazi benki*
→ **benkini**, *Ninakwenda maktaba* → **maktabani**, *Nunua dawa duka la
dawa* → **kwenye duka la dawa**, *Tutakutana mkahawa* → **mkahawani**,
*anafanya kazi hospitali* → **hospitalini**, *Ninaenda ubalozi* →
**ubalozini** usw.

### 4. Falsche Verbformen

- Negation Habitual: *hanywa bia/pombe* → **hanywi** (2×)
- Negativer Subjunktiv: *Usimwacha* → **Usimwache**, *usimwaache* → **usimwache**
- Tempus: *Viongozi wajiuzulu* (Vergangenheit gemeint) → **walijiuzulu**
- kuhama (wegziehen) vs. **kuhamia** (hinziehen): *Tutahama nyumba mpya* → **Tutahamia…**
- kuoa (Mann heiratet) vs. **kuoana** (einander heiraten): *Wataoa* → **Wataoana**
- Passiv statt Aktiv: *Paka anawindwa panya* → **anawinda** (2×)
- Relativform: *Kitabu kilalalo mezani* → **Kitabu kilichopo mezani**
- *Ninaumwa kichwa* → **Ninaumwa na kichwa**
- Bei Geräten „kaputt": *imevunjika* (physisch zerbrochen) → **imeharibika**
  (defekt) bei Friji, Feni, Injini, Jenereta, Lifti, Mashine, Simu, Swichi,
  Televisheni, Eakondisheni

### 5. Kaputte / unverständliche Sätze (neu formuliert)

u. a. *Nifike dakika tano tu* → **Ninahitaji dakika tano tu**, *Alimomba
msaada rafiki yake* → **Alimwomba rafiki yake msaada**, *Anaona ndege mti
juu* → **Anaona ndege juu ya mti**, *Miguu miwili inaitwa mkono wa chini*
(Unsinn) → **Miguu yangu inauma baada ya kutembea sana**, *Ame-jaa tumboni*
→ **Tumbo lake limejaa**, *Kamwe niseme uongo* → **Sisemi uongo kamwe**,
*Plagi la friji imewaka jikoni* → **Plagi ya friji imechomekwa jikoni**,
*Pua yangu inakimbia* (Anglizismus) → **Ninatokwa na makamasi leo**.

### 6. Tipp- und Sprachmischfehler

*Enaeo* → Eneo, *Alichaganya* → Alichanganya, *linapoingra* → linapoingia,
*itaendela* → itaendelea, *unaboreswa* → unaboreshwa, *inanpendeza* →
inampendeza, *kupeanana* → kupeana, *Almnipa* → Alinipa, *kiosikini* →
kioskini, *yameghali* → yamekuwa ghali, „today" → **leo**, „discount" →
**punguzo**, „breakfast" → **kifungua kinywa**, „Oranges" → Orangen,
„Grillflleisch" → Grillfleisch, „Pilaug" → Pilau, „klever" → clever.

### 7. Korrigierte Stichwörter (Headwords)

| vorher | nachher | Grund |
|---|---|---|
| harag | **haragwe** | „harag" existiert nicht |
| kenda | **kwenda** | „kenda" heißt (archaisch) „neun"; Beispiele waren falsch konjugiert |
| kuharuhusiwa | **kuruhusiwa** | Tippfehler |
| kukuwa mafuta | **kuweka mafuta** | „kukuwa" existiert nicht |
| kupodoa | **kujipodoa** | „sich schminken" ist reflexiv |
| kupanda lifti | **kupata lifti** | „mitfahren/mitgenommen werden" = lifti *bekommen*; kupanda lifti = Aufzug nehmen |
| karibu (= bald) | **hivi karibuni** | „karibu" allein heißt nahe/fast/willkommen; „bald" = hivi karibuni |
| kibanda (= Tablett) | **sinia** | kibanda = Hütte/Stand; Tablett = sinia |
| mdomo wa mji (= Mund) | **kinywa** | „mdomo wa mji" = „Mund der Stadt" (Unsinn) |
| pakiti (= Paket) | **kifurushi** | Paket/Päckchen = kifurushi (Beispiele nutzten ohnehin falsche Konkordanz) |
| msionari | **mmishonari** | Standardschreibweise |
| safu (= sauber) | safu = **Reihe / Spalte** | war ein fehlerhaftes Duplikat von „safi"; jetzt echte Bedeutung mit neuen Beispielen |
| kibiriti (= Feuerzeug) | kibiriti = **Streichholz** | kibiriti = Streichholz; Feuerzeug wäre „laita" |

### 8. Korrigierte Nomenklassen (Beispiele nutzten bereits die richtige Konkordanz)

anga, bafu, basi, busu, chungwa, chenza, kabati, kochi, kopo, koti, shati,
tairi, taulo, tofaa, tumbo, nanasi, haragwe, jibu, mafunzo → **Ji-Ma** ·
chipsi, chenji, kiu, jibini, leso, mada, kufuli, siku (+ Komposita) → **N** ·
duka la dawa/mikate/vitabu → **Ji-Ma** · simba → **M-Wa** ·
wakati wa bure → **U** · kinywa, sinia: passend zum neuen Stichwort.

### 9. seed.ts (Dialoge)

- „Marafiki wangu" → **Marafiki zangu**
- Restaurant: Kellner sagte *Naomba menyu* („ich bitte um die Karte") →
  **Hii hapa menyu** (passend zur Übersetzung „Hier ist die Speisekarte")
- *Maji ya chupa mawili* → **Chupa mbili za maji baridi**

## Offene Punkte — bitte entscheiden

Hier war ich mir nicht sicher genug, um still zu ändern:

1. **Duplikate im Pool:** `nunua`/`kununua`, `pata`/`kupata`,
   `safiri`/`kusafiri`, `piki piki`/`pikipiki`, und nach der
   kenda-Korrektur zweimal `kwenda`. Außerdem `-eusi`/`eusi`/`nyeusi`,
   `-kali`/`kali`, `kizuri`/`zuri`/`mzuri`/`nzuri`. Vorschlag: je ein
   Eintrag löschen bzw. Adjektive einheitlich als Stamm (mit `-`) führen.
   Habe nichts gelöscht, nur die Formen selbst korrigiert.
2. **dioranti** (Deodorant): unübliche Schreibweise; gebräuchlicher wäre
   „deodoranti" oder Umschreibung „marashi ya kwapani".
3. **eakondisheni**: verbreitetes Lehnwort, aber das Standardwort für
   Klimaanlage ist **kiyoyozi** (Ki-Vi). Ggf. umbenennen.
4. **maziwa ya kuganda** (Joghurt): üblicher sind **mtindi** oder
   „maziwa mgando".
5. **kihoteli** (Imbiss): eher **mgahawa**; kihoteli ist ungewöhnlich.
6. **Konjugierte Formen als Adjektive** (`amelewa`, `ameoa`, `nimeshiba`,
   `mzima wa afya`): didaktisch okay, aber streng genommen Verbformen —
   so gelassen.
7. **adabu = „höflich" (adjective)**: adabu ist ein Nomen („Höflichkeit/
   Anstand"); die Beispiele benutzen es korrekt als Nomen (`mtu wa adabu`,
   `kwa adabu`). Gloss/POS ggf. anpassen — so gelassen.
8. **Klassenzuordnung belebter N-Nomen** (rafiki, ndugu → N; jirani, simba,
   mbwa → M-Wa): Belebte Nomen nehmen M-Wa-Verbkonkordanz, aber
   N-Possessive. Die App-Zuordnung ist uneinheitlich; für die Lernkarten
   wäre eine Konvention gut (z. B. M-Wa + Hinweis auf yangu/zangu bei
   Verwandtschaftswörtern).
9. **Supabase**: `scripts/fix-grammar-2026-07.sql` muss noch gegen die
   Datenbank laufen, sonst überschreibt der nächste CSV-Export die
   Korrekturen.
