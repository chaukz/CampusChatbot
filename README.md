# Lekgotla 🌿

**Hackathon-winning project — built in 2 hours.**

A campus sustainability assistant for the University of Mpumalanga (Mbombela) that answers student questions about recycling, water refills, shuttle routes, and green initiatives — grounded entirely in real campus data. It doesn't guess: if the answer isn't in the data, it says so.

Built at the UMP Hackathon by **Salt** (Boni Chauke) and **Pepper** (Lesedi Rapetsoa).

---

## What it does

Ask it things like:
- "Where can I recycle plastic?"
- "When is the next shuttle to town?"
- "Where do I refill my water bottle?"
- "How do I join the food garden?"

Every answer is pulled from a seeded dataset of real UMP building codes, recycling points, water stations, shuttle routes, and contacts — not invented. Ask something outside that data and it tells you plainly, instead of making something up.

## Why it's fast, not fragile

Two hours doesn't leave room for a vector database or a retrieval pipeline, so there isn't one. The entire campus dataset (~1,600 tokens) is injected straight into the model's system prompt on every request, alongside one rule that does more work than anything else in this repo:

> Answer ONLY from the campus data. If it's not there, say so — never invent a building, time, or contact.

That single constraint is the difference between a demo that sounds confident and one that's actually trustworthy.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Backend | Express (Node) — a thin proxy that keeps the API key off the browser |
| Model | Claude Haiku 4.5 via the Anthropic API, with an Ollama fallback for offline demos |
| Data | Seeded JSON, sourced from UMP's own building directory — no database |

## Project structure

```
CampusChatbot/
├── server/
│   ├── index.js          # Express app, single /api/chat route
│   ├── model.js           # Anthropic + Ollama adapter, one function, one env flag
│   ├── prompt.js           # Builds the system prompt from campus-data.json
│   ├── campus-data.json    # Seeded campus dataset — the actual product
│   └── .env                # API key (gitignored, not committed)
├── web/
│   └── src/
│       ├── App.jsx          # Homepage + chat UI
│       └── index.css         # Styling
└── PROJECT.md               # Full write-up: problem, architecture, what we learned
```

## Running it locally

```bash
git clone https://github.com/chaukz/CampusChatbot.git
cd CampusChatbot

cd server && npm install && cd ../web && npm install && cd ..
cp .env.example server/.env
# paste your Anthropic API key into server/.env
```

Two terminals:

```bash
cd server && npm run dev     # http://localhost:3001
cd web && npm run dev        # http://localhost:5173
```

No internet or API budget? Set `PROVIDER=ollama` in `server/.env` after `ollama pull llama3.2:3b`, restart the server — nothing else changes.

## The five things a hackathon judge asks about

| | |
|---|---|
| **Problem** | Students don't know where recycling points, water refills, or shuttles are, so campus sustainability infrastructure goes underused. |
| **AI feature** | Natural-language search over real campus data — a direct answer instead of a notice board. |
| **Prototype** | This repo. Working chat UI, homepage, real UMP data, live Claude-backed conversation. |
| **Impact** | Every student with a phone gets a faster path to resources that already exist. |
| **Feasibility** | The AI is the easy part — the real requirement is a human (the Sustainability Office) who keeps `campus-data.json` current. |

See [`PROJECT.md`](./PROJECT.md) for the full write-up.

---
