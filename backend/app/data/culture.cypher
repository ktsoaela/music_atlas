// Cultural layer: languages, instruments, Famo, Motswako, cross-border Basotho & Setswana ecosystems.
// No semicolons inside string property values (seed splitter).

CREATE CONSTRAINT language_id IF NOT EXISTS FOR (l:Language) REQUIRE l.id IS UNIQUE;
CREATE CONSTRAINT instrument_id IF NOT EXISTS FOR (i:Instrument) REQUIRE i.id IS UNIQUE;
CREATE CONSTRAINT culture_id IF NOT EXISTS FOR (c:Culture) REQUIRE c.id IS UNIQUE;

MERGE (l:Language {id:'lang-sesotho'}) SET l.name='Sesotho', l.family='Sotho-Tswana';
MERGE (l:Language {id:'lang-setswana'}) SET l.name='Setswana', l.family='Sotho-Tswana';
MERGE (l:Language {id:'lang-isizulu'}) SET l.name='isiZulu', l.family='Nguni';
MERGE (l:Language {id:'lang-isixhosa'}) SET l.name='isiXhosa', l.family='Nguni';
MERGE (l:Language {id:'lang-xitsonga'}) SET l.name='Xitsonga', l.family='Tswa-Ronga';
MERGE (l:Language {id:'lang-northern-sotho'}) SET l.name='Northern Sotho', l.family='Sotho-Tswana';
MERGE (l:Language {id:'lang-english'}) SET l.name='English', l.family='Germanic';
MERGE (l:Language {id:'lang-afrikaans'}) SET l.name='Afrikaans', l.family='Germanic';
MERGE (l:Language {id:'lang-isindebele'}) SET l.name='isiNdebele', l.family='Nguni';
MERGE (l:Language {id:'lang-siswati'}) SET l.name='siSwati', l.family='Nguni';
MERGE (l:Language {id:'lang-tshivenda'}) SET l.name='Tshivenda', l.family='Venda';
MERGE (l:Language {id:'lang-sasl'}) SET l.name='South African Sign Language', l.family='Sign Language';

MERGE (c:Culture {id:'culture-basotho'}) SET c.name='Basotho', c.description='Sesotho-speaking cultural world spanning Lesotho and parts of South Africa — migrant labour, praise singing, and accordion-driven popular music.';
MERGE (c:Culture {id:'culture-tswana'}) SET c.name='Tswana', c.description='Setswana cultural world across Botswana and South Africa (esp. North West) — storytelling, traditional dance music, and Motswako hip hop.';

MATCH (c:Culture {id:'culture-basotho'}), (l:Language {id:'lang-sesotho'}) MERGE (c)-[:USES_LANGUAGE]->(l);
MATCH (c:Culture {id:'culture-tswana'}), (l:Language {id:'lang-setswana'}) MERGE (c)-[:USES_LANGUAGE]->(l);
MATCH (l:Language {id:'lang-sesotho'}), (p:Place {id:'country-lesotho'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-sesotho'}), (p:Place {id:'province-free-state'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-sesotho'}), (p:Place {id:'province-gauteng'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-setswana'}), (p:Place {id:'country-botswana'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-setswana'}), (p:Place {id:'province-north-west'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-setswana'}), (p:Place {id:'province-gauteng'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-isindebele'}), (p:Place {id:'province-mpumalanga'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-siswati'}), (p:Place {id:'province-mpumalanga'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-siswati'}), (p:Place {id:'country-eswatini'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-tshivenda'}), (p:Place {id:'province-limpopo'}) MERGE (l)-[:SPOKEN_IN]->(p);
MATCH (l:Language {id:'lang-sasl'}), (p:Place {id:'country-south-africa'}) MERGE (l)-[:SPOKEN_IN]->(p);

MERGE (i:Instrument {id:'inst-lesiba'}) SET i.name='Lesiba', i.kind='mouth bow', i.culture='Basotho';
MERGE (i:Instrument {id:'inst-accordion'}) SET i.name='Accordion', i.kind='free reed', i.culture='Basotho / Famo';
MERGE (i:Instrument {id:'inst-lekolulo'}) SET i.name='Lekolulo', i.kind='flute', i.culture='Basotho';
MERGE (i:Instrument {id:'inst-oil-can-bass'}) SET i.name='Oil-can bass', i.kind='homemade string', i.culture='township / folk';
MERGE (i:Instrument {id:'inst-drum'}) SET i.name='Drum', i.kind='percussion', i.culture='regional';

MERGE (p:Place {id:'city-mahikeng'}) SET p.name='Mahikeng', p.kind='city', p.province='North West', p.lat=-25.8652, p.lng=25.6442;
MERGE (p:Place {id:'city-gaborone'}) SET p.name='Gaborone', p.kind='city', p.province='Botswana', p.lat=-24.6282, p.lng=25.9231;
MERGE (p:Place {id:'site-mine-hostels-gauteng'}) SET p.name='Gauteng mine hostels', p.kind='site', p.province='Gauteng', p.lat=-26.2041, p.lng=28.0473;

MATCH (a:Place {id:'city-mahikeng'}), (b:Place {id:'province-north-west'}) MERGE (a)-[:IN_PROVINCE]->(b);
MATCH (a:Place {id:'city-gaborone'}), (b:Place {id:'country-botswana'}) MERGE (a)-[:IN_PROVINCE]->(b);
MATCH (a:Place {id:'site-mine-hostels-gauteng'}), (b:Place {id:'province-gauteng'}) MERGE (a)-[:IN_PROVINCE]->(b);
MATCH (a:Place {id:'country-lesotho'}), (b:Place {id:'province-gauteng'}) MERGE (a)-[:MIGRATION_CORRIDOR {source:'Basotho migrant labour to mines and hostels'}]->(b);
MATCH (a:Place {id:'country-lesotho'}), (b:Place {id:'province-free-state'}) MERGE (a)-[:MIGRATION_CORRIDOR {source:'Cross-border Sesotho living and work'}]->(b);
MATCH (a:Place {id:'country-botswana'}), (b:Place {id:'city-mahikeng'}) MERGE (a)-[:MIGRATION_CORRIDOR {source:'Setswana cultural corridor Botswana–North West'}]->(b);
MATCH (a:Place {id:'city-mahikeng'}), (b:Place {id:'city-johannesburg'}) MERGE (a)-[:MIGRATION_CORRIDOR {source:'Motswako and national hip hop pathway'}]->(b);

MERGE (g:Genre {id:'genre-famo'}) SET g.name='Famo', g.era_start=1960, g.themes=['migrant labour','praise','community','work','oral storytelling'];
MERGE (g:Genre {id:'genre-traditional-sesotho'}) SET g.name='Traditional Sesotho Folk', g.era_start=1800;
MERGE (g:Genre {id:'genre-sesotho-gospel'}) SET g.name='Sesotho Gospel', g.era_start=1970;
MERGE (g:Genre {id:'genre-sesotho-hip-hop'}) SET g.name='Sesotho Hip Hop', g.era_start=2000;
MERGE (g:Genre {id:'genre-motswako'}) SET g.name='Motswako', g.era_start=1997;
MERGE (g:Genre {id:'genre-traditional-tswana'}) SET g.name='Traditional Tswana', g.era_start=1900;
MERGE (g:Genre {id:'genre-maskandi'}) SET g.name='Maskandi', g.era_start=1920;

MATCH (g:Genre {id:'genre-famo'}), (p:Place {id:'country-lesotho'}) MERGE (g)-[:ORIGINATED_IN]->(p);
MATCH (g:Genre {id:'genre-traditional-sesotho'}), (p:Place {id:'country-lesotho'}) MERGE (g)-[:ORIGINATED_IN]->(p);
MATCH (g:Genre {id:'genre-motswako'}), (p:Place {id:'city-mahikeng'}) MERGE (g)-[:ORIGINATED_IN]->(p);
MATCH (g:Genre {id:'genre-traditional-tswana'}), (p:Place {id:'country-botswana'}) MERGE (g)-[:ORIGINATED_IN]->(p);
MATCH (g:Genre {id:'genre-maskandi'}), (p:Place {id:'province-kwazulu-natal'}) MERGE (g)-[:ORIGINATED_IN]->(p);

MATCH (g:Genre {id:'genre-famo'}), (c:Culture {id:'culture-basotho'}) MERGE (g)-[:ROOTED_IN_CULTURE]->(c);
MATCH (g:Genre {id:'genre-traditional-sesotho'}), (c:Culture {id:'culture-basotho'}) MERGE (g)-[:ROOTED_IN_CULTURE]->(c);
MATCH (g:Genre {id:'genre-sesotho-contemporary'}), (c:Culture {id:'culture-basotho'}) MERGE (g)-[:ROOTED_IN_CULTURE]->(c);
MATCH (g:Genre {id:'genre-motswako'}), (c:Culture {id:'culture-tswana'}) MERGE (g)-[:ROOTED_IN_CULTURE]->(c);
MATCH (g:Genre {id:'genre-traditional-tswana'}), (c:Culture {id:'culture-tswana'}) MERGE (g)-[:ROOTED_IN_CULTURE]->(c);

MATCH (g:Genre {id:'genre-famo'}), (i:Instrument {id:'inst-accordion'}) MERGE (g)-[:USES_INSTRUMENT]->(i);
MATCH (g:Genre {id:'genre-famo'}), (i:Instrument {id:'inst-drum'}) MERGE (g)-[:USES_INSTRUMENT]->(i);
MATCH (g:Genre {id:'genre-famo'}), (i:Instrument {id:'inst-lekolulo'}) MERGE (g)-[:USES_INSTRUMENT]->(i);
MATCH (g:Genre {id:'genre-traditional-sesotho'}), (i:Instrument {id:'inst-lesiba'}) MERGE (g)-[:USES_INSTRUMENT]->(i);
MATCH (g:Genre {id:'genre-traditional-sesotho'}), (i:Instrument {id:'inst-oil-can-bass'}) MERGE (g)-[:USES_INSTRUMENT]->(i);

MATCH (g:Genre {id:'genre-famo'}), (p:Genre {id:'genre-traditional-sesotho'}) MERGE (g)-[:INFLUENCED_BY]->(p);
MATCH (g:Genre {id:'genre-sesotho-contemporary'}), (p:Genre {id:'genre-famo'}) MERGE (g)-[:INFLUENCED_BY {note:'shared Sesotho audiences and migrant storytelling lineages'}]->(p);
MATCH (g:Genre {id:'genre-sesotho-hip-hop'}), (p:Genre {id:'genre-hip-hop'}) MERGE (g)-[:INFLUENCED_BY]->(p);
MATCH (g:Genre {id:'genre-sesotho-hip-hop'}), (p:Genre {id:'genre-sesotho-contemporary'}) MERGE (g)-[:INFLUENCED_BY]->(p);
MATCH (g:Genre {id:'genre-motswako'}), (p:Genre {id:'genre-hip-hop'}) MERGE (g)-[:INFLUENCED_BY]->(p);
MATCH (g:Genre {id:'genre-motswako'}), (p:Genre {id:'genre-kwaito'}) MERGE (g)-[:INFLUENCED_BY {note:'kwaito bounce in early Motswako'}]->(p);
MATCH (g:Genre {id:'genre-motswako'}), (p:Genre {id:'genre-traditional-tswana'}) MERGE (g)-[:INFLUENCED_BY {note:'Setswana storytelling into vernacular rap'}]->(p);
MATCH (g:Genre {id:'genre-hip-hop'}), (p:Genre {id:'genre-motswako'}) MERGE (g)-[:INFLUENCED_BY {note:'Motswako fed national SA hip hop'}]->(p);

MERGE (a:Artist {id:'artist-culture-spears'}) SET a.name='Culture Spears', a.bio='Botswana traditional Tswana music and dance group (from 2005) — hits like Kulenyane and Khudu carried rural storytelling across the Setswana world.', a.active_from=2005, a.languages=['Setswana'], a.roles=['group'], a.generation=4;
MERGE (a:Artist {id:'artist-mma-ausi'}) SET a.name='Mma Ausi', a.bio='Setswana cultural artist, singer and dancer — ambassador of traditional Tswana music, fashion and heritage, often linked with Culture Spears.', a.active_from=2005, a.languages=['Setswana'], a.roles=['artist'], a.generation=4;
MERGE (a:Artist {id:'artist-morafe'}) SET a.name='Morafe', a.bio='Motswako hip-hop group — Kay Gee, Towdee Mac and Khuli Chana — formed 1995 in Mafikeng, debut album Maru A Pula, in the HHP lineage.', a.active_from=1995, a.languages=['Setswana','English'], a.roles=['group'], a.generation=4;
MERGE (a:Artist {id:'artist-khuli-chana'}) SET a.name='Khulane Morule', a.stage_name='Khuli Chana', a.bio='Motswako MC from Morafe, born in Mmabatho, who carried Setswana rap into solo national careers — breakthrough solo album Motswakoriginator (2009).', a.active_from=2003, a.languages=['Setswana','English'], a.roles=['artist'], a.generation=5;
MERGE (a:Artist {id:'artist-towdee-mac'}) SET a.name='Lerothodi Moagi', a.stage_name='Towdee Mac', a.bio='Morafe co-founder, producer and Motswako voice — production credits include Morafe\'s "Bereka" and HHP\'s "Platinum Visa".', a.active_from=2003, a.languages=['Setswana','English'], a.roles=['artist'], a.generation=4;
MERGE (a:Artist {id:'artist-kay-gee'}) SET a.name='Kgaugelo Goodchild Phaswana', a.stage_name='Kay Gee', a.bio='Morafe co-founder, born in Venda before his family moved to Mafikeng — taught Khuli Chana to rap in their earlier group Jazzadaz.', a.active_from=2003, a.languages=['Setswana','English'], a.roles=['artist'], a.generation=4;
MERGE (a:Artist {id:'artist-tau-ea-matsekha'}) SET a.name='Tau ea Matsekha', a.bio='Major Famo / accordion vocal force in Basotho popular music — migrant-worker storytelling tradition.', a.active_from=1980, a.languages=['Sesotho'], a.roles=['artist'], a.generation=2;
MERGE (a:Artist {id:'artist-mahlanya'}) SET a.name='Mahlanya', a.bio='Famo artist and accordion-driven Sesotho popular music figure — performances circulate widely on DVD and YouTube.', a.active_from=1990, a.languages=['Sesotho'], a.roles=['artist'], a.generation=3;
MERGE (a:Artist {id:'artist-semanyane'}) SET a.name='Semanyane', a.bio='Famo / Sesotho accordion vocalist in the Basotho migrant-music lineage.', a.active_from=1985, a.languages=['Sesotho'], a.roles=['artist'], a.generation=2;

MATCH (a:Artist {id:'artist-culture-spears'}), (p:Place {id:'city-gaborone'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-mma-ausi'}), (p:Place {id:'country-botswana'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-morafe'}), (p:Place {id:'city-mahikeng'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-khuli-chana'}), (p:Place {id:'city-mahikeng'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-towdee-mac'}), (p:Place {id:'city-mahikeng'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-kay-gee'}), (p:Place {id:'city-mahikeng'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (p:Place {id:'country-lesotho'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-mahlanya'}), (p:Place {id:'country-lesotho'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-semanyane'}), (p:Place {id:'country-lesotho'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-hhp'})-[r:FROM]->() DELETE r;
MATCH (a:Artist {id:'artist-hhp'}), (p:Place {id:'city-mahikeng'}) MERGE (a)-[:FROM]->(p);
MATCH (a:Artist {id:'artist-cassper-nyovest'})-[r:FROM]->() DELETE r;
MATCH (a:Artist {id:'artist-cassper-nyovest'}), (p:Place {id:'city-mahikeng'}) MERGE (a)-[:FROM]->(p);

MATCH (a:Artist {id:'artist-culture-spears'}), (g:Genre {id:'genre-traditional-tswana'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-mma-ausi'}), (g:Genre {id:'genre-traditional-tswana'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-morafe'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-morafe'}), (g:Genre {id:'genre-hip-hop'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-khuli-chana'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-khuli-chana'}), (g:Genre {id:'genre-hip-hop'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-towdee-mac'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-kay-gee'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-hhp'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-cassper-nyovest'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (g:Genre {id:'genre-famo'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-mahlanya'}), (g:Genre {id:'genre-famo'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-semanyane'}), (g:Genre {id:'genre-famo'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-sankomota'}), (g:Genre {id:'genre-traditional-sesotho'}) MERGE (a)-[:PLAYS]->(g);
MATCH (a:Artist {id:'artist-tsepo-tshola'}), (g:Genre {id:'genre-traditional-sesotho'}) MERGE (a)-[:PLAYS]->(g);

MATCH (a:Artist {id:'artist-culture-spears'}), (l:Language {id:'lang-setswana'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-mma-ausi'}), (l:Language {id:'lang-setswana'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-hhp'}), (l:Language {id:'lang-setswana'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-morafe'}), (l:Language {id:'lang-setswana'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-khuli-chana'}), (l:Language {id:'lang-setswana'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-cassper-nyovest'}), (l:Language {id:'lang-setswana'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-sankomota'}), (l:Language {id:'lang-sesotho'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-tsepo-tshola'}), (l:Language {id:'lang-sesotho'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (l:Language {id:'lang-sesotho'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-mahlanya'}), (l:Language {id:'lang-sesotho'}) MERGE (a)-[:SINGS_IN]->(l);
MATCH (a:Artist {id:'artist-semanyane'}), (l:Language {id:'lang-sesotho'}) MERGE (a)-[:SINGS_IN]->(l);

MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (i:Instrument {id:'inst-accordion'}) MERGE (a)-[:USES]->(i);
MATCH (a:Artist {id:'artist-mahlanya'}), (i:Instrument {id:'inst-accordion'}) MERGE (a)-[:USES]->(i);
MATCH (a:Artist {id:'artist-semanyane'}), (i:Instrument {id:'inst-accordion'}) MERGE (a)-[:USES]->(i);

MATCH (a:Artist {id:'artist-culture-spears'}), (b:Artist {id:'artist-mma-ausi'}) MERGE (a)-[:COLLABORATED_WITH {source:'Shared traditional Tswana performance circuit — e.g. Dibeisane'}]->(b);
MATCH (a:Artist {id:'artist-hhp'}), (g:Genre {id:'genre-motswako'}) MERGE (a)-[:PIONEERED {source:'Popularised Motswako — Setswana-led hip hop from the Mahikeng corridor'}]->(g);
MATCH (a:Artist {id:'artist-hhp'}), (b:Artist {id:'artist-morafe'}) MERGE (a)-[:INFLUENCED {source:'Motswako pioneer pathway to Morafe'}]->(b);
MATCH (a:Artist {id:'artist-hhp'}), (b:Artist {id:'artist-cassper-nyovest'}) MERGE (a)-[:INFLUENCED {source:'Setswana hip hop lineage into arena-era SA rap'}]->(b);
MATCH (a:Artist {id:'artist-khuli-chana'}), (b:Artist {id:'artist-morafe'}) MERGE (a)-[:MEMBER_OF {source:'Morafe group history'}]->(b);
MATCH (a:Artist {id:'artist-towdee-mac'}), (b:Artist {id:'artist-morafe'}) MERGE (a)-[:MEMBER_OF {source:'Morafe group history'}]->(b);
MATCH (a:Artist {id:'artist-kay-gee'}), (b:Artist {id:'artist-morafe'}) MERGE (a)-[:MEMBER_OF {source:'Morafe group history'}]->(b);
MATCH (a:Artist {id:'artist-khuli-chana'}), (b:Artist {id:'artist-cassper-nyovest'}) MERGE (a)-[:INFLUENCED {source:'Motswako peers into national hip hop'}]->(b);
MATCH (a:Artist {id:'artist-culture-spears'}), (b:Artist {id:'artist-hhp'}) MERGE (a)-[:INFLUENCED {source:'Traditional Setswana storytelling into Motswako vernacular culture'}]->(b);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (g:Genre {id:'genre-famo'}) MERGE (a)-[:PIONEERED {source:'Famo accordion vocal lineage'}]->(g);
MATCH (a:Artist {id:'artist-mahlanya'}), (g:Genre {id:'genre-famo'}) MERGE (a)-[:CONTRIBUTED_TO {source:'Famo performance and DVD/YouTube circulation'}]->(g);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (b:Artist {id:'artist-sankomota'}) MERGE (a)-[:INFLUENCED {source:'Shared Sesotho popular-music audiences across Lesotho–SA'}]->(b);

MATCH (a:Artist {id:'artist-sankomota'}), (p:Place {id:'site-mine-hostels-gauteng'}) MERGE (a)-[:PERFORMED_IN {source:'Sesotho music in migrant and urban SA listening cultures'}]->(p);
MATCH (a:Artist {id:'artist-tsepo-tshola'}), (p:Place {id:'site-mine-hostels-gauteng'}) MERGE (a)-[:PERFORMED_IN {source:'Cross-border Sesotho reach into Gauteng'}]->(p);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (p:Place {id:'province-free-state'}) MERGE (a)-[:PERFORMED_IN {source:'Famo circulation among Sesotho communities in SA'}]->(p);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (p:Place {id:'province-gauteng'}) MERGE (a)-[:PERFORMED_IN {source:'Migrant-worker and hostel listening cultures'}]->(p);
MATCH (a:Artist {id:'artist-mahlanya'}), (p:Place {id:'province-gauteng'}) MERGE (a)-[:PERFORMED_IN {source:'Famo DVD and live circuits into SA'}]->(p);

MERGE (e:Event {id:'event-migrant-famo'}) SET e.year=1965, e.title='Famo and Basotho migrant labour culture', e.description='Accordion-driven Famo grows with Basotho migrant workers moving between Lesotho, Free State and Gauteng mines and hostels — labour history as music history.', e.kind='history', e.genre='Famo', e.place='Lesotho–Gauteng';
MERGE (e:Event {id:'event-1997-motswako'}) SET e.year=1997, e.title='Motswako takes shape', e.description='HHP and the Mahikeng corridor popularise Setswana-led hip hop blending boom-bap, kwaito bounce and indigenous storytelling.', e.kind='music', e.genre='Motswako', e.place='Mahikeng';
MERGE (e:Event {id:'event-2005-culture-spears'}) SET e.year=2005, e.title='Culture Spears form in Botswana', e.description='Traditional Tswana music and dance group rises with hits that travel the Setswana cultural corridor into South Africa.', e.kind='music', e.genre='Traditional Tswana', e.place='Botswana';

MATCH (e:Event {id:'event-migrant-famo'}), (g:Genre {id:'genre-famo'}) MERGE (e)-[:RELATED_TO_GENRE]->(g);
MATCH (e:Event {id:'event-migrant-famo'}), (a:Artist {id:'artist-tau-ea-matsekha'}) MERGE (e)-[:ABOUT]->(a);
MATCH (e:Event {id:'event-migrant-famo'}), (a:Artist {id:'artist-mahlanya'}) MERGE (e)-[:ABOUT]->(a);
MATCH (e:Event {id:'event-1997-motswako'}), (a:Artist {id:'artist-hhp'}) MERGE (e)-[:ABOUT]->(a);
MATCH (e:Event {id:'event-1997-motswako'}), (g:Genre {id:'genre-motswako'}) MERGE (e)-[:RELATED_TO_GENRE]->(g);
MATCH (e:Event {id:'event-2005-culture-spears'}), (a:Artist {id:'artist-culture-spears'}) MERGE (e)-[:ABOUT]->(a);
MATCH (e:Event {id:'event-2005-culture-spears'}), (a:Artist {id:'artist-mma-ausi'}) MERGE (e)-[:ABOUT]->(a);
