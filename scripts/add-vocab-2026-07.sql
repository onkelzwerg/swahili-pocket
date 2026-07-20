-- Neue Vokabeln aus dem Kiswahili-Deutsch-Wörterbuch-Scan (Juli 2026)
-- Ergänzt shared_vocab um die Einträge, die in public/vocab-pool.json
-- neu hinzugekommen sind. Im Supabase SQL-Editor ausführen.

BEGIN;
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('akili', 'Intelligenz / Verstand', 'noun', 'N', '[{"de": "Dieses Kind ist sehr intelligent.", "sw": "Mtoto huyu ana akili nyingi."}, {"de": "Benutze deinen Verstand gut.", "sw": "Tumia akili zako vizuri."}]'::jsonb, '{"Menschen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('askofu', 'Bischof', 'noun', 'M-Wa', '[{"de": "Der Bischof leitet heute den Gottesdienst.", "sw": "Askofu anaongoza ibada leo."}, {"de": "Die Bischöfe treffen sich in Dodoma.", "sw": "Maaskofu wanakutana Dodoma."}]'::jsonb, '{"Religion"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('chizi', 'Käse (ugs. Lehnwort)', 'noun', 'N', '[{"de": "Ich mag Brot mit Käse.", "sw": "Ninapenda mkate na chizi."}, {"de": "Viele Käsesorten werden im Laden verkauft.", "sw": "Chizi za aina nyingi zinauzwa dukani."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('dunia', 'Welt / Erde', 'noun', 'N', '[{"de": "Die Erde hat sieben Kontinente.", "sw": "Dunia ina mabara saba."}, {"de": "Menschen auf der ganzen Welt lieben Musik.", "sw": "Watu duniani kote wanapenda muziki."}]'::jsonb, '{"Natur"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('glasi', '(Trink-)Glas', 'noun', 'N', '[{"de": "Gib mir bitte ein Glas Wasser.", "sw": "Nipe glasi ya maji tafadhali."}, {"de": "Diese Gläser sind sauber.", "sw": "Glasi hizi ni safi."}]'::jsonb, '{"Zuhause"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('hela', 'Geld (ugs.)', 'noun', 'N', '[{"de": "Ich habe heute nur wenig Geld.", "sw": "Nina hela kidogo tu leo."}, {"de": "Sein Geld ist alle.", "sw": "Hela zake zimeisha."}]'::jsonb, '{"Markt & Einkaufen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('hesabu', 'Rechnen / Abrechnung', 'noun', 'N', '[{"de": "Diese Rechnung ist nicht richtig.", "sw": "Hesabu hii si sahihi."}, {"de": "Die Schüler rechnen im Klassenzimmer.", "sw": "Wanafunzi wanafanya hesabu darasani."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('homa', 'Fieber', 'noun', 'N', '[{"de": "Das Kind hat hohes Fieber.", "sw": "Mtoto ana homa kali."}, {"de": "Sein Fieber ist heute zurückgegangen.", "sw": "Homa yake imepungua leo."}]'::jsonb, '{"Gesundheit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('jamii', 'Gesellschaft / Gemeinschaft', 'noun', 'N', '[{"de": "Unsere Gemeinschaft hilft einander.", "sw": "Jamii yetu inasaidiana."}, {"de": "Viele Gesellschaften leben in Frieden.", "sw": "Jamii nyingi zinaishi kwa amani."}]'::jsonb, '{"Menschen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('jamu', 'Konfitüre / Marmelade', 'noun', 'N', '[{"de": "Ich streiche Marmelade aufs Brot.", "sw": "Ninapaka jamu kwenye mkate."}, {"de": "Mangomarmelade ist sehr süß.", "sw": "Jamu ya embe ni tamu sana."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('Januari', 'Januar', 'noun', 'N', '[{"de": "Januar ist der erste Monat des Jahres.", "sw": "Januari ni mwezi wa kwanza wa mwaka."}, {"de": "Die Schulen öffnen im Januar.", "sw": "Shule zinafunguliwa Januari."}]'::jsonb, '{"Zeit & Kalender"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('jasho', 'Schweiß', 'noun', 'Ji-Ma', '[{"de": "Der Schweiß läuft ihm nach dem Training herunter.", "sw": "Jasho linamtoka baada ya mazoezi."}, {"de": "Er wischte sich den Schweiß vom Gesicht.", "sw": "Alifuta jasho usoni."}]'::jsonb, '{"Gesundheit & Körper"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('jiji', 'Großstadt', 'noun', 'Ji-Ma', '[{"de": "Die Großstadt Dar es Salaam ist groß.", "sw": "Jiji la Dar es Salaam ni kubwa."}, {"de": "Großstädte haben viele Menschen.", "sw": "Majiji makubwa yana watu wengi."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('jinsi', 'Art / Weise', 'noun', 'N', '[{"de": "Zeig mir, wie man Reis kocht.", "sw": "Nionyeshe jinsi ya kupika wali."}, {"de": "Jeder hat seine Art zu arbeiten.", "sw": "Kila mtu ana jinsi yake ya kufanya kazi."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('Jumanne', 'Dienstag', 'noun', 'N', '[{"de": "Am Dienstag spielen wir Fußball.", "sw": "Jumanne tunacheza mpira."}, {"de": "Wir sehen uns Dienstagmorgen.", "sw": "Tutaonana Jumanne asubuhi."}]'::jsonb, '{"Zeit & Kalender"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kabichi', 'Kohl', 'noun', 'N', '[{"de": "Kohl ist ein günstiges Gemüse.", "sw": "Kabichi ni mboga ya bei nafuu."}, {"de": "Ich koche heute Kohl mit Tomaten.", "sw": "Ninapika kabichi na nyanya leo."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kadi', 'Karte (Postkarte, Glückwunschkarte)', 'noun', 'N', '[{"de": "Ich schickte Großmutter eine Weihnachtskarte.", "sw": "Nilimtumia bibi kadi ya Krismasi."}, {"de": "Diese Karten sind sehr schön.", "sw": "Kadi hizi ni nzuri sana."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kanga', 'Kanga (buntes Wickeltuch)', 'noun', 'N', '[{"de": "Mama trägt ein schönes Kanga-Tuch.", "sw": "Mama amevaa kanga nzuri."}, {"de": "Die Kangas Tansanias tragen Sprichwörter.", "sw": "Kanga za Tanzania zina misemo."}]'::jsonb, '{"Kleidung"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('karani', 'Büroangestellte/r', 'noun', 'M-Wa', '[{"de": "Der Büroangestellte arbeitet im Büro.", "sw": "Karani anafanya kazi ofisini."}, {"de": "Die Angestellten ordnen die Dokumente.", "sw": "Makarani wanapanga hati."}]'::jsonb, '{"Arbeiten"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kasoro', 'Mangel / (bei Uhrzeit) vor', 'noun', 'N', '[{"de": "Fünf Minuten vor neun.", "sw": "Saa tatu kasoro dakika tano."}, {"de": "Dieses Auto hat einen kleinen Mangel.", "sw": "Gari hili lina kasoro ndogo."}]'::jsonb, '{"Zeit & Kalender"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kati', 'Mitte / (kati ya) zwischen', 'noun', 'N', '[{"de": "Zwischen dem Haus und der Schule gibt es einen Laden.", "sw": "Kati ya nyumba na shule kuna duka."}, {"de": "Wähle zwischen Tee und Kaffee.", "sw": "Chagua kati ya chai na kahawa."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kaunta', 'Theke / Schalter', 'noun', 'N', '[{"de": "Zahl bitte an der Theke.", "sw": "Lipa kwenye kaunta tafadhali."}, {"de": "Die Bankschalter sind geöffnet.", "sw": "Kaunta za benki zimefunguliwa."}]'::jsonb, '{"Markt & Einkaufen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kibanda', 'Hütte / Verkaufsstand', 'noun', 'Ki-Vi', '[{"de": "Ich kaufe Obst am Stand.", "sw": "Ninanunua matunda kwenye kibanda."}, {"de": "Die Marktstände sind voller Waren.", "sw": "Vibanda vya sokoni vimejaa bidhaa."}]'::jsonb, '{"Markt & Einkaufen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kimvuli', 'Schatten', 'noun', 'Ki-Vi', '[{"de": "Wir ruhten uns im Schatten des Baumes aus.", "sw": "Tulipumzika kwenye kimvuli cha mti."}, {"de": "Der Schatten der Bäume hilft bei Hitze.", "sw": "Vimvuli vya miti vinasaidia wakati wa joto."}]'::jsonb, '{"Natur"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kiongozi', 'Leiter/in / Anführer/in', 'noun', 'M-Wa', '[{"de": "Ein guter Anführer hört den Menschen zu.", "sw": "Kiongozi mzuri anasikiliza watu."}, {"de": "Die Führungskräfte treffen sich heute.", "sw": "Viongozi wanakutana leo."}]'::jsonb, '{"Menschen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kitenge', 'Kitenge (Wickeltuch-Stoff)', 'noun', 'Ki-Vi', '[{"de": "Sie trägt ein buntes Kitenge-Tuch.", "sw": "Amevaa kitenge cha rangi nyingi."}, {"de": "Kitenge-Stoffe werden auf dem Markt verkauft.", "sw": "Vitenge vinauzwa sokoni."}]'::jsonb, '{"Kleidung"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kiwanja', 'Feld / Grundstück / Platz', 'noun', 'Ki-Vi', '[{"de": "Die Kinder spielen auf dem Platz.", "sw": "Watoto wanacheza kwenye kiwanja."}, {"de": "Die Sportplätze sind an der Schule.", "sw": "Viwanja vya mpira viko shuleni."}]'::jsonb, '{"Freizeit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kondakta', 'Schaffner/in', 'noun', 'M-Wa', '[{"de": "Der Schaffner sammelt die Fahrpreise ein.", "sw": "Kondakta anakusanya nauli."}, {"de": "Die Schaffner helfen den Fahrgästen.", "sw": "Makondakta wanasaidia abiria."}]'::jsonb, '{"Transport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kosa', 'Fehler', 'noun', 'Ji-Ma', '[{"de": "Dieser Fehler ist klein.", "sw": "Kosa hili ni dogo."}, {"de": "Wir lernen aus unseren Fehlern.", "sw": "Tunajifunza kutokana na makosa yetu."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('laki', 'hunderttausend', 'noun', 'N', '[{"de": "Hunderttausend sind viele Schilling.", "sw": "Laki moja ni shilingi nyingi."}, {"de": "Dieses Haus kostet fünfhunderttausend.", "sw": "Nyumba hii inagharimu laki tano."}]'::jsonb, '{"Zahlen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('livu', 'Urlaub (von der Arbeit)', 'noun', 'N', '[{"de": "Ich habe diese Woche Urlaub.", "sw": "Niko livu wiki hii."}, {"de": "Er nahm einen Monat Urlaub.", "sw": "Alichukua livu ya mwezi mmoja."}]'::jsonb, '{"Arbeiten"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('magharibi', 'Westen', 'noun', 'N', '[{"de": "Die Sonne geht im Westen unter.", "sw": "Jua linatua upande wa magharibi."}, {"de": "Im Westen Tansanias liegt der Tanganjikasee.", "sw": "Magharibi mwa Tanzania kuna Ziwa Tanganyika."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mashariki', 'Osten', 'noun', 'N', '[{"de": "Die Sonne geht im Osten auf.", "sw": "Jua linachomoza mashariki."}, {"de": "In Ostafrika gibt es viele Länder.", "sw": "Mashariki mwa Afrika kuna nchi nyingi."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('maongezi', 'Gespräch / Unterhaltung', 'noun', 'Ji-Ma', '[{"de": "Unsere Unterhaltung war gut.", "sw": "Maongezi yetu yalikuwa mazuri."}, {"de": "Wir führten gestern ein langes Gespräch.", "sw": "Tulifanya maongezi marefu jana."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mapenzi', 'Liebe', 'noun', 'Ji-Ma', '[{"de": "Wahre Liebe endet nie.", "sw": "Mapenzi ya kweli hayaishi kamwe."}, {"de": "Dieses Ehepaar hat eine große Liebe.", "sw": "Wanandoa hao wana mapenzi makubwa."}]'::jsonb, '{"Emotionen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('marashi', 'Parfüm', 'noun', 'Ji-Ma', '[{"de": "Ihr Parfüm duftet gut.", "sw": "Marashi yake yana harufu nzuri."}, {"de": "Sie legte vor der Feier Parfüm auf.", "sw": "Alijipaka marashi kabla ya sherehe."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('marudio', 'Wiederholung', 'noun', 'Ji-Ma', '[{"de": "Wiederholung hilft, Wörter zu behalten.", "sw": "Marudio yanasaidia kukumbuka maneno."}, {"de": "Wir wiederholen vor der Prüfung.", "sw": "Tunafanya marudio kabla ya mtihani."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('matata', 'Probleme / Ärger', 'noun', 'Ji-Ma', '[{"de": "Kein Problem!", "sw": "Hakuna matata!"}, {"de": "Bring keinen Ärger nach Hause.", "sw": "Usilete matata nyumbani."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('matatu', 'Kleinbus im Liniendienst (Kenia)', 'noun', 'N', '[{"de": "Wir nahmen ein Matatu nach Nairobi.", "sw": "Tulipanda matatu kwenda Nairobi."}, {"de": "Die Matatus sind morgens voll.", "sw": "Matatu zimejaa asubuhi."}]'::jsonb, '{"Transport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mbio', 'Rennen / Lauf', 'noun', 'N', '[{"de": "Er gewann den Hundertmeterlauf.", "sw": "Alishinda mbio za mita mia."}, {"de": "Kinder laufen gern um die Wette.", "sw": "Watoto wanapenda kukimbia mbio."}]'::jsonb, '{"Tiere & Sport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('meli', 'Schiff', 'noun', 'N', '[{"de": "Das Schiff fährt nach Sansibar.", "sw": "Meli inasafiri kwenda Zanzibar."}, {"de": "Große Schiffe sind im Hafen angekommen.", "sw": "Meli kubwa zimefika bandarini."}]'::jsonb, '{"Transport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('meneja', 'Manager/in / Geschäftsführer/in', 'noun', 'M-Wa', '[{"de": "Der Hotelmanager ist freundlich.", "sw": "Meneja wa hoteli ni mkarimu."}, {"de": "Die Manager treffen sich jeden Freitag.", "sw": "Mameneja wanakutana kila Ijumaa."}]'::jsonb, '{"Arbeiten"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('meza', 'Tisch', 'noun', 'N', '[{"de": "Dieser Tisch ist groß.", "sw": "Meza hii ni kubwa."}, {"de": "Die Tische im Klassenzimmer sind neu.", "sw": "Meza za darasani ni mpya."}]'::jsonb, '{"Zuhause"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mimba', 'Schwangerschaft', 'noun', 'N', '[{"de": "Meine Frau ist schwanger.", "sw": "Mke wangu ana mimba."}, {"de": "Die erste Schwangerschaft braucht Sorgfalt.", "sw": "Mimba ya kwanza inahitaji uangalifu."}]'::jsonb, '{"Familie"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('misheni', 'Mission (rel.)', 'noun', 'N', '[{"de": "Die Mission baute hier eine Schule.", "sw": "Misheni ilijenga shule hapa."}, {"de": "Viele Missionen haben Krankenhäuser.", "sw": "Misheni nyingi zina hospitali."}]'::jsonb, '{"Religion"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mpaka', 'Grenze', 'noun', 'M-Mi', '[{"de": "Die Grenze zwischen Tansania und Kenia liegt im Norden.", "sw": "Mpaka wa Tanzania na Kenya uko kaskazini."}, {"de": "Die Grenzen des Landes werden bewacht.", "sw": "Mipaka ya nchi inalindwa."}]'::jsonb, '{"Reisen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mpendwa', 'Liebe/r (Briefanrede)', 'noun', 'M-Wa', '[{"de": "Liebe Anna, wie geht es dir?", "sw": "Mpendwa Anna, habari yako?"}, {"de": "Meine Lieben, willkommen zu Hause.", "sw": "Wapendwa wangu, karibuni nyumbani."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mpenzi', 'Geliebte/r / Schatz', 'noun', 'M-Wa', '[{"de": "Mein Schatz bringt mir Blumen.", "sw": "Mpenzi wangu ananiletea maua."}, {"de": "Die Verliebten spazieren am Strand.", "sw": "Wapenzi wanatembea pwani."}]'::jsonb, '{"Emotionen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('msamiati', 'Wortschatz', 'noun', 'M-Mi', '[{"de": "Mein Swahili-Wortschatz wächst.", "sw": "Msamiati wangu wa Kiswahili unakua."}, {"de": "Lerne jeden Tag neuen Wortschatz.", "sw": "Jifunze msamiati mpya kila siku."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mtaa', 'Stadtteil / Wohnviertel', 'noun', 'M-Mi', '[{"de": "Unser Stadtteil hat viele Läden.", "sw": "Mtaa wetu una maduka mengi."}, {"de": "Die Viertel der Großstadt sind voller Menschen.", "sw": "Mitaa ya jiji ina watu wengi."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mtaalamu', 'Spezialist/in / Experte/in', 'noun', 'M-Wa', '[{"de": "Der Computerspezialist kommt heute.", "sw": "Mtaalamu wa kompyuta anakuja leo."}, {"de": "Die Experten beraten die Regierung.", "sw": "Wataalamu wanashauri serikali."}]'::jsonb, '{"Arbeiten"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mtandao', 'Netzwerk / Netz', 'noun', 'M-Mi', '[{"de": "Das Telefonnetz hat heute Störungen.", "sw": "Mtandao wa simu una matatizo leo."}, {"de": "Soziale Netzwerke sind bei Jugendlichen beliebt.", "sw": "Mitandao ya kijamii inapendwa na vijana."}]'::jsonb, '{"Freizeit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mwizi', 'Dieb/in', 'noun', 'M-Wa', '[{"de": "Der Dieb stahl auf dem Markt ein Handy.", "sw": "Mwizi aliiba simu sokoni."}, {"de": "Die Diebe wurden von der Polizei gefasst.", "sw": "Wezi walikamatwa na polisi."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mwuguzi', 'Krankenpfleger/in', 'noun', 'M-Wa', '[{"de": "Der Krankenpfleger hilft dem Arzt.", "sw": "Mwuguzi anamsaidia daktari."}, {"de": "Die Pfleger arbeiten nachts.", "sw": "Wauguzi wanafanya kazi usiku."}]'::jsonb, '{"Gesundheit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('namna', 'Art und Weise', 'noun', 'N', '[{"de": "Diese Art zu kochen ist einfach.", "sw": "Namna hii ya kupika ni rahisi."}, {"de": "Es gibt viele Arten, eine Sprache zu lernen.", "sw": "Kuna namna nyingi za kujifunza lugha."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nazi', 'Kokosnuss', 'noun', 'N', '[{"de": "Die Kokosnuss hat süßes Wasser.", "sw": "Nazi ina maji matamu."}, {"de": "An der Küste werden viele Kokosnüsse verkauft.", "sw": "Nazi nyingi zinauzwa pwani."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ndala', 'Badesandale / Flip-Flop', 'noun', 'N', '[{"de": "Am Strand trage ich Badesandalen.", "sw": "Ninavaa ndala pwani."}, {"de": "Seine Flip-Flops sind neu.", "sw": "Ndala zake ni mpya."}]'::jsonb, '{"Kleidung"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ngeli', 'Nomenklasse', 'noun', 'N', '[{"de": "Swahili hat viele Nomenklassen.", "sw": "Kiswahili kina ngeli nyingi za majina."}, {"de": "Die M-Wa-Klasse ist für Menschen.", "sw": "Ngeli ya M-Wa ni ya watu."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ng''ombe', 'Rind / Kuh', 'noun', 'M-Wa', '[{"de": "Die Kuh frisst Gras auf dem Feld.", "sw": "Ng''ombe anakula nyasi shambani."}, {"de": "Unsere Rinder geben viel Milch.", "sw": "Ng''ombe wetu wanatoa maziwa mengi."}]'::jsonb, '{"Tiere & Sport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nguruwe', 'Schwein', 'noun', 'M-Wa', '[{"de": "Das Schwein lebt auf dem Bauernhof.", "sw": "Nguruwe anaishi shambani."}, {"de": "Viele Schweine werden in den Dörfern gehalten.", "sw": "Nguruwe wengi wanafugwa vijijini."}]'::jsonb, '{"Tiere & Sport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('njia', 'Weg / Pfad / Methode', 'noun', 'N', '[{"de": "Dieser Weg führt zum Markt.", "sw": "Njia hii inaenda sokoni."}, {"de": "Die Bergwege sind schmal.", "sw": "Njia za mlimani ni nyembamba."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('papai', 'Papaya', 'noun', 'Ji-Ma', '[{"de": "Diese Papaya ist gut gereift.", "sw": "Papai hili limeiva vizuri."}, {"de": "Papayas werden auf dem Markt verkauft.", "sw": "Mapapai yanauzwa sokoni."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('pasi', 'Bügeleisen', 'noun', 'N', '[{"de": "Dieses Bügeleisen ist sehr heiß.", "sw": "Pasi hii ni ya moto sana."}, {"de": "Ich bügle mein Hemd.", "sw": "Ninapiga pasi shati langu."}]'::jsonb, '{"Zuhause"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('peni', 'Kugelschreiber / Füller', 'noun', 'N', '[{"de": "Mein Kugelschreiber ist leer.", "sw": "Peni yangu imeisha wino."}, {"de": "Kauf zwei Stifte im Laden.", "sw": "Nunua peni mbili dukani."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('pilau', 'Pilau (Gewürzreisgericht)', 'noun', 'N', '[{"de": "Der Pilau von Sansibar ist berühmt.", "sw": "Pilau ya Zanzibar ni maarufu."}, {"de": "Bei Festen kochen wir Pilau.", "sw": "Tunapika pilau kwenye sherehe."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('poda', 'Puder (kosmetisch)', 'noun', 'N', '[{"de": "Sie trägt Puder im Gesicht auf.", "sw": "Anajipaka poda usoni."}, {"de": "Dieser Puder duftet gut.", "sw": "Poda hii ina harufu nzuri."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('sababu', 'Grund / Ursache', 'noun', 'N', '[{"de": "Der Grund des Unfalls ist unbekannt.", "sw": "Sababu ya ajali haijulikani."}, {"de": "Es gibt viele Gründe, Swahili zu lernen.", "sw": "Kuna sababu nyingi za kujifunza Kiswahili."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('saizi', 'Größe (Kleidung)', 'noun', 'N', '[{"de": "Meine Schuhgröße ist vierzig.", "sw": "Saizi yangu ya viatu ni arobaini."}, {"de": "Dieses Hemd hat eine große Größe.", "sw": "Shati hili lina saizi kubwa."}]'::jsonb, '{"Kleidung"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('salamu', 'Grüße', 'noun', 'N', '[{"de": "Viele Grüße aus Tansania!", "sw": "Salamu nyingi kutoka Tanzania!"}, {"de": "Richte Mama meine Grüße aus.", "sw": "Mpelekee mama salamu zangu."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('shingo', 'Hals / Nacken', 'noun', 'N', '[{"de": "Mein Hals tut heute weh.", "sw": "Shingo yangu inauma leo."}, {"de": "Giraffen haben lange Hälse.", "sw": "Twiga wana shingo ndefu."}]'::jsonb, '{"Gesundheit & Körper"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('suruali', 'Hose (lange)', 'noun', 'N', '[{"de": "Meine Hose ist lang.", "sw": "Suruali yangu ni ndefu."}, {"de": "Diese Hosen sind günstig.", "sw": "Suruali hizi ni za bei nafuu."}]'::jsonb, '{"Kleidung"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('tabu', 'Mühe / Not', 'noun', 'N', '[{"de": "Er hatte Mühe, Arbeit zu finden.", "sw": "Alipata tabu kupata kazi."}, {"de": "Das Stadtleben hat viele Mühen.", "sw": "Maisha ya mjini yana tabu nyingi."}]'::jsonb, '{"Emotionen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('tambi', 'Nudeln', 'noun', 'N', '[{"de": "Nudeln mit Soße sind ein einfaches Essen.", "sw": "Tambi na mchuzi ni chakula rahisi."}, {"de": "Ich koche heute Abend Nudeln.", "sw": "Ninapika tambi leo jioni."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('timu', 'Team / Mannschaft', 'noun', 'N', '[{"de": "Unser Team hat heute gewonnen.", "sw": "Timu yetu imeshinda leo."}, {"de": "Zwei Mannschaften spielen im Stadion.", "sw": "Timu mbili zinacheza uwanjani."}]'::jsonb, '{"Tiere & Sport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ugali', 'Ugali (fester Maisbrei)', 'noun', 'U', '[{"de": "Ugali mit Fisch ist ein Hauptgericht.", "sw": "Ugali na samaki ni chakula kikuu."}, {"de": "Mama kocht jeden Abend Ugali.", "sw": "Mama anapika ugali kila jioni."}]'::jsonb, '{"Essen & Trinken"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ukoo', 'Sippe / Clan', 'noun', 'U', '[{"de": "Unsere Sippe stammt vom Kilimanjaro.", "sw": "Ukoo wetu unatoka Kilimanjaro."}, {"de": "Viele Clans haben eine lange Geschichte.", "sw": "Koo nyingi zina historia ndefu."}]'::jsonb, '{"Familie"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ukurasa', 'Seite (im Buch)', 'noun', 'U', '[{"de": "Schlag Seite zehn auf.", "sw": "Fungua ukurasa wa kumi."}, {"de": "Dieses Buch hat zweihundert Seiten.", "sw": "Kitabu hiki kina kurasa mia mbili."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('wasiwasi', 'Sorge / Nervosität', 'noun', 'U', '[{"de": "Mach dir keine Sorgen, alles wird gut.", "sw": "Usiwe na wasiwasi, kila kitu kitakuwa sawa."}, {"de": "Seine Nervosität verschwand nach der Prüfung.", "sw": "Wasiwasi wake uliisha baada ya mtihani."}]'::jsonb, '{"Emotionen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('yaya', 'Kindermädchen', 'noun', 'M-Wa', '[{"de": "Das Kindermädchen betreut unsere Kinder.", "sw": "Yaya analea watoto wetu."}, {"de": "Kindermädchen arbeiten mit Liebe.", "sw": "Mayaya wanafanya kazi kwa upendo."}]'::jsonb, '{"Familie"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('zulia', 'Teppich', 'noun', 'Ji-Ma', '[{"de": "Der neue Teppich liegt im Wohnzimmer.", "sw": "Zulia jipya liko sebuleni."}, {"de": "Die Teppiche werden jede Woche gereinigt.", "sw": "Mazulia yanasafishwa kila wiki."}]'::jsonb, '{"Zuhause"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('moja', 'eins', 'noun', 'N', '[{"de": "Ich habe nur eine Frage.", "sw": "Nina swali moja tu."}, {"de": "Wir blieben einen Tag in Arusha.", "sw": "Tulikaa siku moja Arusha."}]'::jsonb, '{"Zahlen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mbili', 'zwei', 'noun', 'N', '[{"de": "Ich habe zwei Schwestern.", "sw": "Nina dada wawili."}, {"de": "Kauf zwei Brote.", "sw": "Nunua mikate miwili."}]'::jsonb, '{"Zahlen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nne', 'vier', 'noun', 'N', '[{"de": "Unsere Familie hat vier Personen.", "sw": "Familia yetu ina watu wanne."}, {"de": "Ich kaufte vier Orangen.", "sw": "Nilinunua machungwa manne."}]'::jsonb, '{"Zahlen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('sabini', 'siebzig', 'noun', 'N', '[{"de": "Großmutter ist siebzig Jahre alt.", "sw": "Bibi ana miaka sabini."}, {"de": "Die Klasse hat siebzig Schüler.", "sw": "Darasa lina wanafunzi sabini."}]'::jsonb, '{"Zahlen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuambia', '(jemandem) sagen / erzählen', 'verb', NULL, '[{"de": "Sag mir bitte die Wahrheit.", "sw": "Niambie ukweli tafadhali."}, {"de": "Er erzählte den Kindern eine Geschichte.", "sw": "Aliwaambia watoto hadithi."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuchelewa', 'sich verspäten / zu spät kommen', 'verb', NULL, '[{"de": "Komm morgen nicht zu spät zur Schule.", "sw": "Usichelewe shuleni kesho."}, {"de": "Wir kamen zu spät in der Stadt an.", "sw": "Tulichelewa kufika mjini."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuendelea', 'weitermachen / vorankommen', 'verb', NULL, '[{"de": "Mach weiter mit deiner guten Arbeit.", "sw": "Endelea na kazi yako nzuri."}, {"de": "Der Unterricht geht gut voran.", "sw": "Masomo yanaendelea vizuri."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuharibika', 'kaputtgehen / verderben', 'verb', NULL, '[{"de": "Das Auto ist unterwegs kaputtgegangen.", "sw": "Gari limeharibika njiani."}, {"de": "Früchte verderben schnell bei Hitze.", "sw": "Matunda yanaharibika haraka kwenye joto."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuibia', '(jemanden) bestehlen', 'verb', NULL, '[{"de": "Er bestahl den alten Mann um sein Geld.", "sw": "Alimwibia mzee pesa."}, {"de": "Bestiehl die Leute auf dem Markt nicht.", "sw": "Usiwaibie watu sokoni."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kukohoa', 'husten', 'verb', NULL, '[{"de": "Der Kranke hustet nachts viel.", "sw": "Mgonjwa anakohoa sana usiku."}, {"de": "Die Kinder husten wegen des Staubs.", "sw": "Watoto wanakohoa kwa sababu ya vumbi."}]'::jsonb, '{"Gesundheit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kukubali', 'zustimmen / akzeptieren', 'verb', NULL, '[{"de": "Ich akzeptiere deinen Vorschlag.", "sw": "Ninakubali pendekezo lako."}, {"de": "Sie stimmten zu, zusammenzuarbeiten.", "sw": "Walikubali kufanya kazi pamoja."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kulaza', 'hinlegen / ins Bett legen', 'verb', NULL, '[{"de": "Die Mutter legt das Kind ins Bett.", "sw": "Mama analaza mtoto kitandani."}, {"de": "Sie legten den Kranken ins Krankenhaus.", "sw": "Walimlaza mgonjwa hospitalini."}]'::jsonb, '{"Familie"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kumaliza', 'beenden / fertigstellen', 'verb', NULL, '[{"de": "Ich habe meine heutige Arbeit beendet.", "sw": "Nimemaliza kazi yangu ya leo."}, {"de": "Die Schüler beendeten die Prüfung früh.", "sw": "Wanafunzi walimaliza mtihani mapema."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kungoja', 'warten (auf)', 'verb', NULL, '[{"de": "Ich warte an der Bushaltestelle auf dich.", "sw": "Ninakungoja kwenye kituo cha basi."}, {"de": "Wir warteten, bis der Regen aufhörte.", "sw": "Tulingoja mvua iishe."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kupeleka', '(hin)bringen', 'verb', NULL, '[{"de": "Ich bringe das Kind zur Schule.", "sw": "Ninampeleka mtoto shuleni."}, {"de": "Sie brachten die Briefe zur Post.", "sw": "Walipeleka barua postani."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kupita', 'vorbeigehen / vorbeifahren', 'verb', NULL, '[{"de": "Der Bus fährt hier jede Stunde vorbei.", "sw": "Basi linapita hapa kila saa."}, {"de": "Die Schüler gehen an der Kirche vorbei.", "sw": "Wanafunzi wanapita mbele ya kanisa."}]'::jsonb, '{"Transport"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kupokea', 'empfangen / erhalten', 'verb', NULL, '[{"de": "Ich habe heute deinen Brief erhalten.", "sw": "Nimepokea barua yako leo."}, {"de": "Sie empfingen die Gäste mit Freude.", "sw": "Walipokea wageni kwa furaha."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuposti', 'mit der Post schicken', 'verb', NULL, '[{"de": "Ich schicke diesen Brief morgen mit der Post ab.", "sw": "Nitaposti barua hii kesho."}, {"de": "Wir verschickten die Weihnachtskarten früh.", "sw": "Tuliposti kadi za Krismasi mapema."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kupungua', 'abnehmen / sinken / weniger werden', 'verb', NULL, '[{"de": "Der Zuckerpreis ist gesunken.", "sw": "Bei ya sukari imepungua."}, {"de": "Die Patienten im Krankenhaus sind weniger geworden.", "sw": "Wagonjwa wamepungua hospitalini."}]'::jsonb, '{"Markt & Einkaufen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kurudia', 'wiederholen', 'verb', NULL, '[{"de": "Wiederhole bitte diesen Satz.", "sw": "Rudia sentensi hii tafadhali."}, {"de": "Wir wiederholen jeden Tag die neuen Wörter.", "sw": "Tunarudia maneno mapya kila siku."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kusikia', 'hören / fühlen', 'verb', NULL, '[{"de": "Ich höre die Stimme eines Vogels.", "sw": "Ninasikia sauti ya ndege."}, {"de": "Hört ihr diesen Lärm?", "sw": "Mnasikia kelele hizo?"}]'::jsonb, '{"Gesundheit & Körper"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kutafsiri', 'übersetzen', 'verb', NULL, '[{"de": "Übersetze diesen Satz ins Deutsche.", "sw": "Tafsiri sentensi hii kwa Kijerumani."}, {"de": "Er übersetzt Swahili-Bücher.", "sw": "Anatafsiri vitabu vya Kiswahili."}]'::jsonb, '{"Arbeit & Schule"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kutazama', '(an)schauen / betrachten', 'verb', NULL, '[{"de": "Ich schaue abends fern.", "sw": "Ninatazama televisheni jioni."}, {"de": "Die Kinder schauen den Vögeln am Himmel zu.", "sw": "Watoto wanatazama ndege angani."}]'::jsonb, '{"Freizeit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kutoa', 'herausnehmen / (heraus)geben', 'verb', NULL, '[{"de": "Nimm die Bücher aus der Tasche.", "sw": "Toa vitabu kwenye begi."}, {"de": "Sie geben den Armen Hilfe.", "sw": "Wanatoa msaada kwa maskini."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kutoka', 'kommen aus / stammen', 'verb', NULL, '[{"de": "Er kommt aus Deutschland.", "sw": "Anatoka Ujerumani."}, {"de": "Die Schüler kommen aus dem Klassenzimmer.", "sw": "Wanafunzi wanatoka darasani."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuwa', 'sein / werden', 'verb', NULL, '[{"de": "Er möchte Arzt werden.", "sw": "Anataka kuwa daktari."}, {"de": "Die Kinder sollten jetzt in der Schule sein.", "sw": "Watoto wanapaswa kuwa shuleni sasa."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuwaka', 'brennen / an sein (Licht, Feuer)', 'verb', NULL, '[{"de": "Das Licht brennt im Wohnzimmer.", "sw": "Taa inawaka sebuleni."}, {"de": "Das Feuer brennt in der Küche.", "sw": "Moto unawaka jikoni."}]'::jsonb, '{"Zuhause"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuzaa', 'gebären', 'verb', NULL, '[{"de": "Sie gebar ein Mädchen.", "sw": "Alizaa mtoto wa kike."}, {"de": "Unsere Kuh hat zwei Kälber geboren.", "sw": "Ng''ombe wetu amezaa ndama wawili."}]'::jsonb, '{"Familie"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('chache', 'wenige', 'adjective', NULL, '[{"de": "Ich habe nur wenige Urlaubstage.", "sw": "Nina siku chache tu za likizo."}, {"de": "Wenige Leute kamen zur Besprechung.", "sw": "Watu wachache walikuja mkutanoni."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ema', 'gütig / gut (Charakter)', 'adjective', NULL, '[{"de": "Er ist ein sehr gütiger Mensch.", "sw": "Yeye ni mtu mwema sana."}, {"de": "Gute Eltern erziehen Kinder gut.", "sw": "Wazazi wema wanalea watoto vizuri."}]'::jsonb, '{"Emotionen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nyeupe', 'weiß', 'adjective', NULL, '[{"de": "Sein Kleid ist weiß.", "sw": "Nguo yake ni nyeupe."}, {"de": "Die Wände des Hauses sind weiß.", "sw": "Kuta za nyumba ni nyeupe."}]'::jsonb, '{}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('gonjwa', 'krank', 'adjective', NULL, '[{"de": "Das Kind ist heute krank.", "sw": "Mtoto ni mgonjwa leo."}, {"de": "Kranke Menschen brauchen Medikamente.", "sw": "Watu wagonjwa wanahitaji dawa."}]'::jsonb, '{"Gesundheit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ingi', 'viel(e)', 'adjective', NULL, '[{"de": "Ich habe heute viel Arbeit.", "sw": "Nina kazi nyingi leo."}, {"de": "Viele Menschen mögen die Küste.", "sw": "Watu wengi wanapenda pwani."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ingine', 'andere/r/s', 'adjective', NULL, '[{"de": "Gib mir bitte ein anderes Buch.", "sw": "Nipe kitabu kingine tafadhali."}, {"de": "Andere Leute kommen morgen.", "sw": "Watu wengine wanakuja kesho."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kamili', 'vollständig / genau (Uhrzeit)', 'adjective', NULL, '[{"de": "Um Punkt zehn Uhr fahren wir los.", "sw": "Saa nne kamili tutaondoka."}, {"de": "Deine Antwort ist vollständig.", "sw": "Jibu lako ni kamili."}]'::jsonb, '{"Zeit & Kalender"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nene', 'dick / korpulent', 'adjective', NULL, '[{"de": "Jener Mensch ist etwas korpulent.", "sw": "Mtu yule ni mnene kidogo."}, {"de": "Dicke Bäume geben guten Schatten.", "sw": "Miti minene inatoa kivuli kizuri."}]'::jsonb, '{"Menschen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('rasmi', 'offiziell', 'adjective', NULL, '[{"de": "Dieser Brief ist offiziell.", "sw": "Barua hii ni rasmi."}, {"de": "Offizielle Sitzungen beginnen um neun Uhr.", "sw": "Mikutano rasmi inaanza saa tatu."}]'::jsonb, '{"Arbeiten"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('vivu', 'faul (Lebewesen)', 'adjective', NULL, '[{"de": "Ein faules Kind lernt nicht gern.", "sw": "Mtoto mvivu hapendi kusoma."}, {"de": "Faule Arbeiter kommen zu spät zur Arbeit.", "sw": "Wafanyakazi wavivu wanachelewa kazini."}]'::jsonb, '{"Menschen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('zee', 'alt (Lebewesen)', 'adjective', NULL, '[{"de": "Unser Hund ist jetzt alt.", "sw": "Mbwa wetu ni mzee sasa."}, {"de": "Alte Menschen haben Weisheit.", "sw": "Watu wazee wana hekima."}]'::jsonb, '{"Menschen"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('zima', 'gesund / ganz', 'adjective', NULL, '[{"de": "Der Kranke ist wieder gesund.", "sw": "Mgonjwa amekuwa mzima tena."}, {"de": "Wir blieben den ganzen Tag am Strand.", "sw": "Tulikaa siku nzima pwani."}]'::jsonb, '{"Gesundheit"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('halafu', '(und) dann / danach', 'adverb', NULL, '[{"de": "Iss zuerst, dann ruh dich aus.", "sw": "Kula kwanza, halafu pumzika."}, {"de": "Wir gingen zum Markt und kehrten danach nach Hause zurück.", "sw": "Tulienda sokoni, halafu tukarudi nyumbani."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kabla', 'vorher / bevor', 'adverb', NULL, '[{"de": "Wasch die Hände vor dem Essen.", "sw": "Nawa mikono kabla ya kula."}, {"de": "Überprüfe vor der Reise das Auto.", "sw": "Kabla ya safari, angalia gari."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('karibu', 'fast / in der Nähe / willkommen!', 'adverb', NULL, '[{"de": "Willkommen in unserem Zuhause!", "sw": "Karibu nyumbani kwetu!"}, {"de": "Ich habe fast die ganze Arbeit beendet.", "sw": "Nimemaliza karibu kazi yote."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kisha', '(und) dann / anschließend', 'adverb', NULL, '[{"de": "Lies zuerst, dann schreib.", "sw": "Soma kwanza, kisha andika."}, {"de": "Wir aßen und gingen danach schlafen.", "sw": "Tulikula, kisha tukaenda kulala."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kutwa', 'den ganzen Tag / tagsüber', 'adverb', NULL, '[{"de": "Er arbeitete den ganzen Tag.", "sw": "Alifanya kazi kutwa nzima."}, {"de": "Die Kinder spielten den ganzen Tag.", "sw": "Watoto walicheza kutwa."}]'::jsonb, '{"Zeit & Kalender"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('la sivyo', 'sonst / andernfalls', 'adverb', NULL, '[{"de": "Steh jetzt auf, sonst kommst du zu spät.", "sw": "Amka sasa, la sivyo utachelewa."}, {"de": "Zahl die Rechnung, sonst wird der Strom abgestellt.", "sw": "Lipa bili, la sivyo umeme utakatwa."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mbona', 'wie kommt es, dass / warum denn', 'adverb', NULL, '[{"de": "Wie kommt es, dass du so müde bist?", "sw": "Mbona umechoka hivyo?"}, {"de": "Warum bist du gestern denn nicht gekommen?", "sw": "Mbona hukuja jana?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mno', '(all)zu / überaus', 'adverb', NULL, '[{"de": "Dieses Essen ist überaus lecker.", "sw": "Chakula hiki ni kitamu mno."}, {"de": "Kauf keine allzu teuren Sachen.", "sw": "Usinunue vitu ghali mno."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ndani', 'drinnen / innen', 'adverb', NULL, '[{"de": "Die Kinder sind im Haus.", "sw": "Watoto wako ndani ya nyumba."}, {"de": "Komm herein, draußen regnet es.", "sw": "Ingia ndani, nje kuna mvua."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ngapi', 'wie viel(e)', 'adverb', NULL, '[{"de": "Wie alt bist du?", "sw": "Una miaka mingapi?"}, {"de": "Was kostet ein Kilo Bananen?", "sw": "Kilo moja ya ndizi ni shilingi ngapi?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('pembeni', 'seitlich / zur Seite', 'adverb', NULL, '[{"de": "Stell die Tasche zur Seite.", "sw": "Weka begi pembeni."}, {"de": "Stell dich an den Straßenrand.", "sw": "Simama pembeni ya barabara."}]'::jsonb, '{"Ort"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('sawasawa', 'richtig / korrekt / na gut', 'adverb', NULL, '[{"de": "Du hast die Arbeit richtig gemacht.", "sw": "Umefanya kazi sawasawa."}, {"de": "Na gut, treffen wir uns morgen.", "sw": "Sawasawa, tukutane kesho."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('upesi', 'schnell / rasch', 'adverb', NULL, '[{"de": "Komm schnell, das Essen ist fertig!", "sw": "Njoo upesi, chakula kiko tayari!"}, {"de": "Sie beendeten die Arbeit rasch.", "sw": "Walimaliza kazi upesi."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('vibaya', 'schlecht (Art und Weise)', 'adverb', NULL, '[{"de": "Er hat letzte Nacht schlecht geschlafen.", "sw": "Alilala vibaya jana usiku."}, {"de": "Sprich nicht schlecht über andere.", "sw": "Usiongee vibaya kuhusu wengine."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('vigumu', 'schwer / schwierig (es ist ...)', 'adverb', NULL, '[{"de": "Es ist schwer, nachts ein Taxi zu bekommen.", "sw": "Ni vigumu kupata teksi usiku."}, {"de": "Diese Fragen sind schwer zu beantworten.", "sw": "Maswali haya ni vigumu kujibu."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('zamani', 'früher / damals', 'adverb', NULL, '[{"de": "Früher reisten die Menschen zu Fuß.", "sw": "Zamani watu walisafiri kwa miguu."}, {"de": "Dieses Haus ist alt.", "sw": "Nyumba hii ni ya zamani."}]'::jsonb, '{"Zeit & Kalender"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('au', 'oder', 'other', NULL, '[{"de": "Möchtest du Tee oder Kaffee?", "sw": "Unataka chai au kahawa?"}, {"de": "Wir fahren heute oder morgen.", "sw": "Tutaenda leo au kesho."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('baada ya', 'nach (zeitlich)', 'other', NULL, '[{"de": "Nach der Arbeit ruhen wir uns aus.", "sw": "Baada ya kazi tunapumzika."}, {"de": "Nach dem Regen kam die Sonne heraus.", "sw": "Baada ya mvua jua lilitoka."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('badala ya', '(an)statt / anstelle von', 'other', NULL, '[{"de": "Trink Wasser statt Limonade.", "sw": "Kunywa maji badala ya soda."}, {"de": "Juma kam anstelle von Musa.", "sw": "Juma alikuja badala ya Musa."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('bali', 'sondern', 'other', NULL, '[{"de": "Ich mag keinen Tee, sondern Kaffee.", "sw": "Sipendi chai, bali ninapenda kahawa."}, {"de": "Er war nicht krank, sondern nur müde.", "sw": "Hakuwa mgonjwa, bali alikuwa amechoka tu."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('bila', 'ohne', 'other', NULL, '[{"de": "Ich trinke Tee ohne Zucker.", "sw": "Ninakunywa chai bila sukari."}, {"de": "Geh nicht, ohne dich zu verabschieden.", "sw": "Usiondoke bila kuaga."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('chini ya', 'unter (räumlich)', 'other', NULL, '[{"de": "Der Ball ist unter dem Tisch.", "sw": "Mpira uko chini ya meza."}, {"de": "Setz dich unter diesen Baum.", "sw": "Kaa chini ya mti huu."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('gani', 'welche/r/s / was für', 'other', NULL, '[{"de": "Welches Buch möchtest du?", "sw": "Unataka kitabu gani?"}, {"de": "Welche Spiele mögt ihr?", "sw": "Mnapenda michezo gani?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('hadi', 'bis (zeitlich, räumlich)', 'other', NULL, '[{"de": "Wir arbeiten bis zum Abend.", "sw": "Tutafanya kazi hadi jioni."}, {"de": "Der Bus fährt bis Arusha.", "sw": "Basi linaenda hadi Arusha."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('hakuna', 'es gibt kein / nicht', 'other', NULL, '[{"de": "Kein Problem.", "sw": "Hakuna shida."}, {"de": "Es gibt heute kein Wasser.", "sw": "Hakuna maji leo."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('haya', 'na gut / abgemacht', 'other', NULL, '[{"de": "Na gut, fangen wir mit der Arbeit an.", "sw": "Haya, tuanze kazi."}, {"de": "Abgemacht, wir sehen uns morgen.", "sw": "Haya, tutaonana kesho."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('hodi', 'Klopfformel: Darf ich eintreten?', 'other', NULL, '[{"de": "Hodi! Darf ich hereinkommen?", "sw": "Hodi! Naomba kuingia."}, {"de": "Er klopfte an die Tür und sagte hodi.", "sw": "Aligonga mlango akasema hodi."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ikiwa', 'falls / wenn', 'other', NULL, '[{"de": "Falls es regnet, bleiben wir zu Hause.", "sw": "Ikiwa mvua itanyesha, tutabaki nyumbani."}, {"de": "Wenn du Fragen hast, frag mich.", "sw": "Ikiwa una maswali, niulize."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ila', 'außer / nur', 'other', NULL, '[{"de": "Alle kamen außer Juma.", "sw": "Wote walikuja ila Juma."}, {"de": "Ich habe alles außer Zeit.", "sw": "Nina kila kitu ila muda."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ili', 'damit / um zu', 'other', NULL, '[{"de": "Ich lerne Swahili, um mit den Menschen zu sprechen.", "sw": "Ninajifunza Kiswahili ili niongee na watu."}, {"de": "Steh früh auf, damit du nicht zu spät kommst.", "sw": "Amka mapema ili usichelewe."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ingawa', 'obwohl', 'other', NULL, '[{"de": "Obwohl er alt ist, hat er viel Kraft.", "sw": "Ingawa ni mzee, ana nguvu nyingi."}, {"de": "Er ging zur Arbeit, obwohl er krank war.", "sw": "Alienda kazini ingawa alikuwa mgonjwa."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('je', 'Fragepartikel', 'other', NULL, '[{"de": "Kommst du morgen?", "sw": "Je, unakuja kesho?"}, {"de": "Habt ihr schon gegessen?", "sw": "Je, mmeshakula?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kadhaa', 'mehrere / einige', 'other', NULL, '[{"de": "Ich wartete mehrere Stunden.", "sw": "Nilisubiri kwa saa kadhaa."}, {"de": "Mehrere Leute stellten diese Frage.", "sw": "Watu kadhaa waliuliza swali hilo."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('katika', 'in (räumlich)', 'other', NULL, '[{"de": "Wir wohnen in einem kleinen Haus.", "sw": "Tunaishi katika nyumba ndogo."}, {"de": "In der Bibliothek gibt es viele Bücher.", "sw": "Kuna vitabu vingi katika maktaba."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuanzia', 'ab / von ... an', 'other', NULL, '[{"de": "Ab morgen stehe ich früh auf.", "sw": "Kuanzia kesho nitaamka mapema."}, {"de": "Der Laden ist ab acht Uhr morgens geöffnet.", "sw": "Duka linafunguliwa kuanzia saa mbili asubuhi."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuhusu', 'über / bezüglich (Thema)', 'other', NULL, '[{"de": "Wir sprachen über unsere Reise.", "sw": "Tulizungumza kuhusu safari yetu."}, {"de": "Ich lese ein Buch über die Geschichte Tansanias.", "sw": "Ninasoma kitabu kuhusu historia ya Tanzania."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuliko', 'als (Komparativ)', 'other', NULL, '[{"de": "Der Kilimanjaro ist höher als der Meru.", "sw": "Kilimanjaro ni mrefu kuliko Meru."}, {"de": "Ich mag Tee lieber als Kaffee.", "sw": "Ninapenda chai kuliko kahawa."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kuna', 'es gibt', 'other', NULL, '[{"de": "Heute sind viele Leute auf dem Markt.", "sw": "Kuna watu wengi sokoni leo."}, {"de": "Gibt es irgendeine Frage?", "sw": "Kuna swali lolote?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kupitia', 'über / via', 'other', NULL, '[{"de": "Wir reisten über Moshi.", "sw": "Tulisafiri kupitia Moshi."}, {"de": "Ich fand die Arbeit über meinen Freund.", "sw": "Nilipata kazi kupitia rafiki yangu."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kwa', 'mit / bei / für / pro', 'other', NULL, '[{"de": "Wir reisen mit dem Bus.", "sw": "Tunasafiri kwa basi."}, {"de": "Er schnitt das Brot mit dem Messer.", "sw": "Alikata mkate kwa kisu."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kwaheri', 'auf Wiedersehen', 'other', NULL, '[{"de": "Auf Wiedersehen, wir sehen uns morgen!", "sw": "Kwaheri, tutaonana kesho!"}, {"de": "Er sagte uns auf Wiedersehen und ging.", "sw": "Alituambia kwaheri akaondoka."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kwamba', 'dass', 'other', NULL, '[{"de": "Ich weiß, dass du Swahili lernst.", "sw": "Ninajua kwamba unajifunza Kiswahili."}, {"de": "Er sagte, dass er morgen kommt.", "sw": "Alisema kwamba atakuja kesho."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('kwani', 'denn / sag mal', 'other', NULL, '[{"de": "Sag mal, warum bist du heute zu spät?", "sw": "Kwani umechelewa leo?"}, {"de": "Zieh eine Jacke an, denn draußen ist es kalt.", "sw": "Vaa koti, kwani nje ni baridi."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('marahaba', 'Antwort auf den Ehrengruß Shikamoo', 'other', NULL, '[{"de": "Das Kind sagte Shikamoo, die Großmutter antwortete Marahaba.", "sw": "Mtoto alisema shikamoo, bibi akajibu marahaba."}, {"de": "Marahaba, mein Enkelkind.", "sw": "Marahaba, mjukuu wangu."}]'::jsonb, '{"Religion & Kultur"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('na', 'und / mit', 'other', NULL, '[{"de": "Ich trinke Tee mit Milch.", "sw": "Ninakunywa chai na maziwa."}, {"de": "Vater und Mutter kochen zusammen.", "sw": "Baba na mama wanapika pamoja."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nani', 'wer', 'other', NULL, '[{"de": "Wer kommt heute?", "sw": "Nani anakuja leo?"}, {"de": "Wem gehört dieses Buch?", "sw": "Kitabu hiki ni cha nani?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('ni', 'ist / sind (Kopula)', 'other', NULL, '[{"de": "Heute ist Montag.", "sw": "Leo ni Jumatatu."}, {"de": "Wir sind Schüler.", "sw": "Sisi ni wanafunzi."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nini', 'was', 'other', NULL, '[{"de": "Was machst du gerade?", "sw": "Unafanya nini sasa?"}, {"de": "Was ist das?", "sw": "Hii ni nini?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('pole', 'Ausdruck des Mitgefühls (mein Beileid / gute Besserung)', 'other', NULL, '[{"de": "Mein Beileid zu deinem Verlust.", "sw": "Pole kwa msiba wako."}, {"de": "Viel Kraft bei der Arbeit!", "sw": "Pole na kazi!"}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('samahani', 'Entschuldigung!', 'other', NULL, '[{"de": "Entschuldigung, ich bin zu spät.", "sw": "Samahani, nimechelewa."}, {"de": "Entschuldigung, wo ist die Toilette?", "sw": "Samahani, choo kiko wapi?"}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('shikamoo', 'Ehrengruß für Ältere', 'other', NULL, '[{"de": "Shikamoo, Großvater!", "sw": "Shikamoo, babu!"}, {"de": "Kinder grüßen die Älteren mit Shikamoo.", "sw": "Watoto wanasema shikamoo kwa wazee."}]'::jsonb, '{"Religion & Kultur"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('tafadhali', 'bitte', 'other', NULL, '[{"de": "Bitte hilf mir kurz.", "sw": "Tafadhali, nisaidie kidogo."}, {"de": "Schließ bitte die Tür.", "sw": "Funga mlango, tafadhali."}]'::jsonb, '{"Alltag"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('tangu', 'seit', 'other', NULL, '[{"de": "Ich wohne hier seit letztem Jahr.", "sw": "Ninaishi hapa tangu mwaka jana."}, {"de": "Wir haben uns seit Januar nicht gesehen.", "sw": "Hatujaonana tangu Januari."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('wala', 'weder ... noch', 'other', NULL, '[{"de": "Ich habe weder Geld noch Zeit.", "sw": "Sina pesa wala muda."}, {"de": "Er hat heute weder gegessen noch getrunken.", "sw": "Hakula wala hakunywa leo."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('yaani', 'das heißt / also', 'other', NULL, '[{"de": "Er kommt übermorgen, das heißt am Mittwoch.", "sw": "Anakuja kesho kutwa, yaani Jumatano."}, {"de": "Das Grundnahrungsmittel, also Ugali, wird täglich gegessen.", "sw": "Chakula kikuu, yaani ugali, kinaliwa kila siku."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('mimi', 'ich', 'other', NULL, '[{"de": "Ich bin Lehrer.", "sw": "Mimi ni mwalimu."}, {"de": "Ich und du werden zusammen reisen.", "sw": "Mimi na wewe tutasafiri pamoja."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('wewe', 'du', 'other', NULL, '[{"de": "Wer bist du?", "sw": "Wewe ni nani?"}, {"de": "Und du, woher kommst du?", "sw": "Na wewe, unatoka wapi?"}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('yeye', 'er / sie', 'other', NULL, '[{"de": "Sie ist meine Schwester.", "sw": "Yeye ni dada yangu."}, {"de": "Er arbeitet bei einer Bank.", "sw": "Yeye anafanya kazi benkini."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('sisi', 'wir', 'other', NULL, '[{"de": "Wir sind eine Familie.", "sw": "Sisi ni familia moja."}, {"de": "Wir reisen gern.", "sw": "Sisi tunapenda kusafiri."}]'::jsonb, '{"Grammatik"}', true, 'approved');
INSERT INTO shared_vocab (swahili, german, part_of_speech, noun_class, examples, topics, is_active, review_status)
VALUES ('nyinyi', 'ihr', 'other', NULL, '[{"de": "Ihr seid gute Freunde.", "sw": "Nyinyi ni marafiki wazuri."}, {"de": "Woher kommt ihr?", "sw": "Nyinyi mnatoka wapi?"}]'::jsonb, '{"Grammatik"}', true, 'approved');

COMMIT;
