I absolutely love this idea.

What you're describing is something closer to a **Musical Knowledge Graph** than a timeline. Think of it like how historians map royal families, or how software engineers map dependencies in Linux. Instead of code dependencies, you're mapping **people, crews, cities, genres, mentorship, rivalries, collaborations, labels, and influence**.

Imagine the project as **"The South African Music Atlas (1980–2026)."**

---

# Level 1 - Timeline

```
1980s
│
├── Anti-Apartheid Music
├── Bubblegum
├── Kwaito Seeds
└── Cape Flats Hip Hop Begins

1990s
│
├── Prophets of Da City
├── Black Noise
├── Brasse Vannie Kaap
├── Kwaito Explosion
└── House Music

2000s
│
├── Ishmael
├── ProKid
├── Zola
├── HHP
├── Teargas
├── Skwatta Kamp
├── TKZee
└── Gospel Boom

2010s
│
├── Cassper Nyovest
├── AKA
├── Nasty C
├── Kwesta
├── A-Reece
├── SA Trap
├── Gqom
└── Amapiano Origins

2020s
│
├── Amapiano Global
├── Uncle Waffles
├── Kabza
├── DJ Maphorisa
├── Young Stunna
├── Blxckie
├── Tyson Sybateli
└── New Generation
```

---

# Level 2 - Geographic Map

Imagine clicking on a province.

## Western Cape

```
Cape Town

↓

Prophets of Da City

↓

Black Noise

↓

Brasse Vannie Kaap

↓

Godessa

↓

Cape Flats Hip Hop

↓

Influence spreads nationally
```

---

## Gauteng

```
Johannesburg

↓

Kwaito

↓

TKZee

↓

Boom Shaka

↓

Skwatta Kamp

↓

Teargas

↓

Cassper

AKA

A-Reece

Nasty C (national influence)

Amapiano
```

---

## KwaZulu-Natal

```
Durban

↓

Big NUZ

↓

Professor

↓

DJ Tira

↓

Gqom

↓

Distruction Boyz

↓

Babes Wodumo

↓

Durban Trap

↓

Blxckie
```

---

# Level 3 - Relationship Graph

This is where it becomes fascinating.

```
Prophets of Da City
       │
       │ inspired
       ▼
Ishmael
       │
       ├────────────┐
       │            │
 collaborated    influenced
       │            │
       ▼            ▼
 ProKid         New Generation
```

Every artist would have relationships such as:

* Inspired by
* Collaborated with
* Produced by
* Signed to
* Discovered by
* Mentor of
* Rival of
* Member of
* Featured on
* Sampled
* Founded label

---

# Example: Ishmael

```
Ishmael Morabe

Genre:
• Hip Hop
• Conscious Rap

City:
• Johannesburg

Inspired by:
• Prophets of Da City
• Public Enemy
• Rakim

Collaborated with:
• ProKid
• HHP
• Others

Influenced:
• Younger SA lyricists

Era:
1998–Present

Albums

Awards

Interviews

Music Videos
```

---

# Level 4 - Tabs

Each artist page could have tabs like Wikipedia.

```
[Overview]

[Timeline]

[Discography]

[Collaborations]

[Influences]

[Who They Influenced]

[Crews]

[Labels]

[Music Videos]

[Awards]

[Interviews]

[Historical Context]

[Legacy]
```

---

# Level 5 - Interactive Network

This is the exciting part.

Click **Prophets of Da City**.

The screen expands.

```
                 Public Enemy

                     │

                     ▼

          Prophets of Da City

          │       │        │

          ▼       ▼        ▼

     Black Noise  BVK   Cape MCs

          │

          ▼

       Ishmael

      /    |     \

   HHP  ProKid  Others

      \      /

       ▼    ▼

     Cassper

       AKA

     Kwesta

      A-Reece

      Tyson Sybateli
```

Like Google's Knowledge Graph or Obsidian's graph view, you could zoom into any artist and see their connections.

---

# Level 6 - Multiple Timelines

Users could switch between views:

* Hip Hop
* Kwaito
* Gospel
* Jazz
* House
* Amapiano
* Gqom
* Afro Pop
* Maskandi
* Rock
* Reggae

Or combine them to see how genres intersect.

---

# Level 7 - Historical Events

Include broader South African history alongside the music.

```
1994
│
├── Democracy
├── Explosion of Kwaito
└── New recording labels

2010
│
├── FIFA World Cup
├── Increased international exposure
└── Rise of digital platforms

2020
│
├── COVID
├── Streaming dominance
└── Amapiano goes global
```

This helps explain *why* musical shifts happened.

---

# Level 8 - Your "Mission Control"

I can imagine this as an interactive dashboard:

```
🇿🇦 SOUTH AFRICAN MUSIC ATLAS

──────────────────────────────────

🗺 Map

📅 Timeline

👥 Influence Graph

🎤 Artists

💿 Albums

🎧 Songs

🏢 Labels

🎬 Videos

🏆 Awards

📚 History

🎭 Genres

📍 Cities

──────────────────────────────────

Search:

"Ishmael"

──────────────────────────────────

Influenced By

↓

Prophets of Da City

↓

Collaborators

↓

ProKid

↓

Inspired

↓

Cassper Nyovest

↓

Modern Artists

↓

Tyson Sybateli
```

## The technology behind it

This is very similar to how knowledge graphs are built for large organizations. You could model it with:

* **Python** for data ingestion and analysis.
* **Neo4j** (a graph database) to store artists and their relationships.
* **FastAPI** to expose the data as an API.
* **React** or **Next.js** with a graph visualization library (such as Cytoscape.js or React Flow) to create an interactive interface.
* **Obsidian** during the research phase, using notes and backlinks before importing everything into the graph database.

Over time, this could grow beyond hip hop into a comprehensive archive of South African music history, showing not just *when* artists appeared, but *how* ideas, styles, collaborations, and regional scenes spread across the country from the 1980s to 2026. It would become a living map of South Africa's musical evolution rather than just a list of artists.





---
Yes—but with an important caveat.

**Gramps can work surprisingly well as the research database, but not as the final visualization.**

Gramps is designed for genealogy, where the core idea is:

* Person → Parent
* Person → Child
* Person → Spouse
* Events
* Places
* Sources
* Notes
* Media

Music history isn't that different. You'd simply reinterpret the relationships.

For example:

| Genealogy | Music Atlas                         |
| --------- | ----------------------------------- |
| Person    | Artist                              |
| Family    | Crew / Collective                   |
| Parent    | Mentor / Influence                  |
| Marriage  | Collaboration                       |
| Event     | Album release, concert, award       |
| Place     | City, province                      |
| Source    | Interviews, documentaries, articles |
| Note      | Biography                           |

So for your example:

```
Prophets of Da City
│
├── Mentored
│      Ishmael
│
├── Inspired
│      Black Noise
│
├── Collaborated
│      Brasse Vannie Kaap
│
└── Influenced
       Cape Hip Hop
```

Gramps also lets you:

* 📸 Attach album covers and artist photos.
* 📚 Cite sources for every claim.
* 📍 Record places like Cape Town, Soweto, Durban, Mthatha, etc.
* 📅 Create chronological events (albums, awards, label signings, group formations).
* 📝 Keep detailed research notes.

### Where Gramps falls short

Music relationships are much richer than family trees.

An artist might have:

* 40 collaborations
* 15 influences
* 8 producers
* 6 labels
* 3 crews
* 5 genres
* 2 rivalries

Gramps isn't built for that many relationship types, so you'll end up stretching it beyond its intended purpose.

### A workflow I'd recommend

**Phase 1 – Research**

* Gramps (people, places, dates, sources, notes)

↓

**Phase 2 – Export**

* Export to CSV, XML, or GEDCOM

↓

**Phase 3 – Knowledge Graph**

* Neo4j

↓

**Phase 4 – Interactive Website**

* FastAPI + React/Next.js + Cytoscape.js or React Flow

This gives you the best of both worlds:

* **Gramps** acts like your historian's notebook, where everything is sourced and organized.
* **Neo4j** becomes the living network that users can explore interactively.

I actually think this could become a unique digital archive of South African music history. You wouldn't just be documenting artists—you'd be preserving the connections between generations, cities, genres, labels, and movements in a way that's rarely been done.


---
Yes—but only **parts of it**.

The **South African Music Library (SAMRO's archives, university collections, national libraries, broadcasters, and similar institutions)** generally preserve music and historical records. They are not typically structured as a relationship graph showing who influenced whom.

They often have information such as:

* Artist biographies
* Album and song catalogues
* Release dates
* Record labels
* Sheet music (for some genres)
* Recordings
* Photographs
* Posters and concert programmes
* Interviews (in some collections)
* Newspaper clippings
* Copyright and composer information
* Historical documents

However, they're much less likely to explicitly record connections like:

```text
Prophets of Da City
        ↓
Influenced
        ↓
Ishmael
        ↓
Inspired
        ↓
ProKid
        ↓
Influenced
        ↓
Cassper Nyovest
```

or

```text
Cape Town Hip Hop
        ↓
Cape Flats Culture
        ↓
Conscious Rap
        ↓
Johannesburg Scene
        ↓
Modern SA Hip Hop
```

Those relationships usually have to be **inferred and documented** by combining many sources:

* Artist interviews
* Documentaries
* Magazine articles
* Podcasts
* Books
* Album liner notes
* Academic research
* Radio interviews
* Social media posts
* Oral histories

That's exactly what historians and musicologists do.

### Your project would go a step further

Instead of simply archiving songs, you'd be creating a **South African Music Knowledge Graph**, where every connection is backed by evidence.

For example:

```
Prophets of Da City

Source:
1993 interview

↓

"Ishmael says they inspired him..."

↓

Source attached

↓

Relationship created

Influenced → Ishmael
```

Then:

```
Ishmael

↓

Interview in 2005

↓

"ProKid was one of the young MCs I respected..."

↓

Relationship

Mentored → ProKid
```

Every relationship would have a citation, making it transparent and verifiable.

That kind of structured, evidence-backed graph is something I haven't seen for South African music. There are archives, discographies, and biographies, but not a comprehensive map of **who influenced whom, where scenes emerged, how genres spread geographically, and how artists are connected over time**. Building that would be a significant contribution to documenting South Africa's musical heritage.


---
I genuinely think this is one of the most interesting long-term projects you've mentioned because it combines your interests in **knowledge management, Python, graphs, Linux, history, and AI** into something with cultural value.

I'd think of it as the **South African Music Knowledge Project**.

## Phase 1 — Build the Archive

Start with a simple database of facts.

### Artists

* Name
* Stage name
* Birthplace
* Active years
* Genres
* Languages
* Biography

### Groups

* Members
* Years active
* City
* Albums

### Albums

* Release date
* Tracks
* Label
* Producers

### Songs

* Writers
* Producers
* Featured artists

### Places

* Cities
* Townships
* Studios
* Venues

---

## Phase 2 — Build the Relationships

Instead of only storing artists, store **how they're connected**.

```
Prophets of Da City

 ├── Inspired → Ishmael
 ├── Collaborated → Black Noise
 ├── Performed at → Oppikoppi
 ├── From → Cape Town
 └── Influenced → Cape Hip Hop
```

Eventually you'll have thousands of relationships.

---

## Phase 3 — Timeline

```
1980

↓

Cape Flats Hip Hop

↓

1990

↓

Prophets of Da City

↓

1994

↓

Kwaito Explosion

↓

2000

↓

Skwatta Kamp

↓

2005

↓

ProKid

↓

2010

↓

AKA

↓

Cassper

↓

2015

↓

Nasty C

↓

A-Reece

↓

2020

↓

Amapiano

↓

2026
```

---

## Phase 4 — Interactive Map

Imagine clicking on **Cape Town**.

It would show:

* Artists from Cape Town
* Studios
* Record labels
* Important concerts
* Albums recorded there
* Genres born there

Click **Johannesburg** and you see its own musical ecosystem.

---

## Phase 5 — AI

This is where it becomes really exciting.

An AI assistant trained on the archive could answer questions like:

* "Who inspired ProKid?"
* "Show every artist connected to Ishmael."
* "How did Cape Town hip hop influence Gauteng?"
* "Which producers worked with both AKA and Cassper?"
* "Show every female rapper from Durban between 1995 and 2015."
* "How did Amapiano evolve from House and Kwaito?"

Instead of searching the web, it would reason over your knowledge graph.

---

## Phase 6 — Beyond Music

Once the platform exists, you could create parallel knowledge graphs for other parts of South African culture:

* 🇿🇦 South African Music
* ⚽ South African Football
* 🎬 South African Film & TV
* 📚 South African Literature
* 🗳️ Political History
* 🎨 Visual Arts
* 🏛️ Cultural Heritage

Each would connect people, places, events, organizations, and timelines.

## Why I think you'd enjoy building it

Based on our conversations, you've been interested in:

* Understanding systems from the inside (Linux, operating systems, Python internals).
* Building knowledge bases in Obsidian.
* Learning graph-like thinking rather than just writing documents.
* Exploring AI, RAG, and knowledge retrieval.

This project sits at the intersection of all of those interests. It's not just another CRUD application—it becomes a living knowledge graph that people can explore, search, and even ask questions about. If built carefully over several years, it could become one of the most comprehensive digital maps of South African music history.

