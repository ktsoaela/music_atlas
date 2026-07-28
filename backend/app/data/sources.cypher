// Curated multi-tier citations for key artists.
// Tier 1–2 use stable public URLs; tiers 3–5 are research leads with explicit caution.
// Live APIs (Wikidata/MusicBrainz/Wikipedia/Discogs) add more via POST /api/admin/enrich.

CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE;

MERGE (s:Source {id:'src-curated-makeba-wiki'}) SET s.title='Wikipedia: Miriam Makeba', s.tier=2, s.provider='wikipedia', s.url='https://en.wikipedia.org/wiki/Miriam_Makeba', s.excerpt='Biography covering exile, UN address, and global career.';
MERGE (s:Source {id:'src-curated-makeba-wd'}) SET s.title='Wikidata: Miriam Makeba', s.tier=1, s.provider='wikidata', s.url='https://www.wikidata.org/wiki/Q190055', s.excerpt='Structured identifiers, occupations, awards.';
MERGE (s:Source {id:'src-curated-makeba-mb'}) SET s.title='MusicBrainz: Miriam Makeba', s.tier=1, s.provider='musicbrainz', s.url='https://musicbrainz.org/search?query=Miriam+Makeba&type=artist', s.excerpt='Stable artist ID after POST /api/admin/enrich.';
MERGE (s:Source {id:'src-curated-makeba-doc'}) SET s.title='Documentary lead: Mama Africa / Makeba films', s.tier=3, s.provider='documentary', s.url=null, s.excerpt='Search film archives and YouTube for Makeba documentary interviews — extract exile and collaboration claims with timestamps.';
MERGE (s:Source {id:'src-curated-makeba-book'}) SET s.title='Book lead: Makeba autobiographies & SA jazz histories', s.tier=2, s.provider='books', s.url=null, s.excerpt='Use published autobiographies and jazz histories for high-confidence narrative claims.';

MATCH (a:Artist {id:'artist-miriam-makeba'}), (s:Source {id:'src-curated-makeba-wiki'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-miriam-makeba'}), (s:Source {id:'src-curated-makeba-wd'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-miriam-makeba'}), (s:Source {id:'src-curated-makeba-mb'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-miriam-makeba'}), (s:Source {id:'src-curated-makeba-doc'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-miriam-makeba'}), (s:Source {id:'src-curated-makeba-book'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-brenda-wiki'}) SET s.title='Wikipedia: Brenda Fassie', s.tier=2, s.provider='wikipedia', s.url='https://en.wikipedia.org/wiki/Brenda_Fassie', s.excerpt='Career from Big Dudes through democracy-era hits.';
MERGE (s:Source {id:'src-curated-brenda-discogs'}) SET s.title='Discogs lead: Brenda Fassie credits', s.tier=1, s.provider='discogs', s.url='https://www.discogs.com/search/?q=Brenda+Fassie&type=artist', s.excerpt='Album credits for producers including Chicco Twala.';
MERGE (s:Source {id:'src-curated-brenda-interview'}) SET s.title='Interview lead: Brenda Fassie TV & press', s.tier=3, s.provider='interview', s.url=null, s.excerpt='Transcribe interviews mentioning Chicco, township pop, and influence on later youth genres.';
MERGE (s:Source {id:'src-curated-brenda-press'}) SET s.title='Press lead: SA newspaper obituaries & features', s.tier=4, s.provider='newspaper', s.url=null, s.excerpt='2004 obituaries and career features — verify dates and collaborators.';
MERGE (s:Source {id:'src-curated-brenda-fan'}) SET s.title='Fan / forum lead (tier 5)', s.tier=5, s.provider='fan-site', s.url=null, s.excerpt='Use only as leads — promote claims to the graph only after Discogs/interview corroboration.';

MATCH (a:Artist {id:'artist-brenda-fassie'}), (s:Source {id:'src-curated-brenda-wiki'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-brenda-fassie'}), (s:Source {id:'src-curated-brenda-discogs'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-brenda-fassie'}), (s:Source {id:'src-curated-brenda-interview'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-brenda-fassie'}), (s:Source {id:'src-curated-brenda-press'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-brenda-fassie'}), (s:Source {id:'src-curated-brenda-fan'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-chicco-wiki'}) SET s.title='Wikipedia / search: Chicco Twala', s.tier=2, s.provider='wikipedia', s.url='https://en.wikipedia.org/wiki/Chicco_Twala', s.excerpt='Producer-connector biography if page exists — else use MusicBrainz/Discogs.';
MERGE (s:Source {id:'src-curated-chicco-discogs'}) SET s.title='Discogs lead: Chicco production credits', s.tier=1, s.provider='discogs', s.url='https://www.discogs.com/search/?q=Chicco+Twala&type=artist', s.excerpt='Primary evidence for PRODUCED_FOR relationships.';
MERGE (s:Source {id:'src-curated-chicco-interview'}) SET s.title='Interview lead: Chicco on bubblegum to kwaito', s.tier=3, s.provider='interview', s.url=null, s.excerpt='Search YouTube/podcasts for Chicco discussing Brenda, township dance, and Arthur Mafokate.';
MERGE (s:Source {id:'src-curated-chicco-mag'}) SET s.title='Magazine lead: SA music press on Chicco', s.tier=4, s.provider='magazine', s.url=null, s.excerpt='Period features on bubblegum producers.';

MATCH (a:Artist {id:'artist-chicco-twala'}), (s:Source {id:'src-curated-chicco-wiki'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-chicco-twala'}), (s:Source {id:'src-curated-chicco-discogs'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-chicco-twala'}), (s:Source {id:'src-curated-chicco-interview'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-chicco-twala'}), (s:Source {id:'src-curated-chicco-mag'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-kwaito-doc'}) SET s.title='Documentary lead: Kwaito generation (Arthur, Mdu, Trompies)', s.tier=3, s.provider='documentary', s.url=null, s.excerpt='Documentaries and TV specials on post-94 kwaito — extract pioneer claims with timestamps.';
MERGE (s:Source {id:'src-curated-kwaito-book'}) SET s.title='Book lead: Kwaito & township culture studies', s.tier=2, s.provider='books', s.url=null, s.excerpt='Academic and popular books on kwaito for event and genre context.';
MERGE (s:Source {id:'src-curated-kwaito-podcast'}) SET s.title='Podcast lead: kwaito oral history', s.tier=3, s.provider='podcast', s.url=null, s.excerpt='Artist-hosted podcasts often state mentorship not found in Discogs.';
MERGE (s:Source {id:'src-curated-kwaito-festival'}) SET s.title='Festival / label lead: 90s Gauteng kwaito circuit', s.tier=4, s.provider='festival', s.url=null, s.excerpt='Festival lineups and label pages for scene geography.';

MATCH (a:Artist {id:'artist-arthur-mafokate'}), (s:Source {id:'src-curated-kwaito-doc'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-mdu-masilela'}), (s:Source {id:'src-curated-kwaito-doc'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-trompies'}), (s:Source {id:'src-curated-kwaito-doc'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-arthur-mafokate'}), (s:Source {id:'src-curated-kwaito-book'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-mdu-masilela'}), (s:Source {id:'src-curated-kwaito-book'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-spikiri'}), (s:Source {id:'src-curated-kwaito-podcast'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-trompies'}), (s:Source {id:'src-curated-kwaito-festival'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-poc-wiki'}) SET s.title='Wikipedia: Prophets of Da City', s.tier=2, s.provider='wikipedia', s.url='https://en.wikipedia.org/wiki/Prophets_of_Da_City', s.excerpt='Cape Town hip hop origins and political context.';
MERGE (s:Source {id:'src-curated-poc-archive'}) SET s.title='Archive lead: Cape Flats hip hop collections', s.tier=2, s.provider='archives', s.url=null, s.excerpt='University / community archives for early SA hip hop ephemera.';
MERGE (s:Source {id:'src-curated-poc-social'}) SET s.title='Social lead (tier 5): contemporary shout-outs', s.tier=5, s.provider='social', s.url=null, s.excerpt='Inspiration claims on social media — corroborate before graphing.';

MATCH (a:Artist {id:'artist-prophets-of-da-city'}), (s:Source {id:'src-curated-poc-wiki'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-prophets-of-da-city'}), (s:Source {id:'src-curated-poc-archive'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-prophets-of-da-city'}), (s:Source {id:'src-curated-poc-social'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-tsepo-wiki'}) SET s.title='Wikipedia: Tsepo Tshola', s.tier=2, s.provider='wikipedia', s.url='https://en.wikipedia.org/wiki/Tsepo_Tshola', s.excerpt='Lesotho–SA corridor biography.';
MERGE (s:Source {id:'src-curated-sankomota-mb'}) SET s.title='MusicBrainz lead: Sankomota', s.tier=1, s.provider='musicbrainz', s.url='https://musicbrainz.org/search?query=Sankomota&type=artist', s.excerpt='Stable artist ID after enrich.';
MERGE (s:Source {id:'src-curated-tsepo-press'}) SET s.title='Press lead: obituaries & Sesotho music features', s.tier=4, s.provider='newspaper', s.url=null, s.excerpt='2021 coverage of The Village Pope legacy.';

MATCH (a:Artist {id:'artist-tsepo-tshola'}), (s:Source {id:'src-curated-tsepo-wiki'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-sankomota'}), (s:Source {id:'src-curated-sankomota-mb'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-tsepo-tshola'}), (s:Source {id:'src-curated-tsepo-press'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-amapiano-press'}) SET s.title='Press lead: Amapiano global era', s.tier=4, s.provider='magazine', s.url=null, s.excerpt='2020+ features linking house, kwaito DNA, and Bacardi.';
MERGE (s:Source {id:'src-curated-lekompo-press'}) SET s.title='Press lead: Lekompo / Limpopo electronic', s.tier=4, s.provider='newspaper', s.url=null, s.excerpt='Reporting that distinguishes Lekompo from Amapiano while noting shared audiences.';
MERGE (s:Source {id:'src-curated-lekompo-blog'}) SET s.title='Blog lead (tier 5): Lekompo explainers', s.tier=5, s.provider='blog', s.url=null, s.excerpt='Scene blogs — verify against artists and Discogs before promoting edges.';

MATCH (a:Artist {id:'artist-kabza-de-small'}), (s:Source {id:'src-curated-amapiano-press'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-shebeshxt'}), (s:Source {id:'src-curated-lekompo-press'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-shebeshxt'}), (s:Source {id:'src-curated-lekompo-blog'}) MERGE (a)-[:CITED_IN]->(s);

MERGE (s:Source {id:'src-curated-famo-yt'}) SET s.title='YouTube lead: Famo accordion performances', s.tier=3, s.provider='documentary', s.url=null, s.excerpt='Search Mahlanya / Sephetho Famo DVDs and live clips — extract migrant and praise themes with timestamps.';
MATCH (a:Artist {id:'artist-mahlanya'}), (s:Source {id:'src-curated-famo-yt'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-tau-ea-matsekha'}), (s:Source {id:'src-curated-famo-yt'}) MERGE (a)-[:CITED_IN]->(s);
MERGE (s:Source {id:'src-curated-motswako-hhp'}) SET s.title='Interview lead: HHP and Motswako', s.tier=3, s.provider='interview', s.url=null, s.excerpt='Oral history on Setswana rap, Mahikeng, and the path to Morafe and Cassper.';
MATCH (a:Artist {id:'artist-hhp'}), (s:Source {id:'src-curated-motswako-hhp'}) MERGE (a)-[:CITED_IN]->(s);
MERGE (s:Source {id:'src-curated-culture-spears-yt'}) SET s.title='YouTube lead: Culture Spears and Mma Ausi', s.tier=3, s.provider='documentary', s.url=null, s.excerpt='Dibeisane and traditional Tswana performance clips — corroborate before promoting edges.';
MATCH (a:Artist {id:'artist-culture-spears'}), (s:Source {id:'src-curated-culture-spears-yt'}) MERGE (a)-[:CITED_IN]->(s);
MATCH (a:Artist {id:'artist-mma-ausi'}), (s:Source {id:'src-curated-culture-spears-yt'}) MERGE (a)-[:CITED_IN]->(s);
