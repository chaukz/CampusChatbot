import { useState, useRef, useEffect } from "react";

// Flip to true to build the UI without the server running.
const USE_MOCK = false;

const STARTERS = [
  "Where can I recycle plastic?",
  "When is the next shuttle to town?",
  "Where do I refill my water bottle?",
  "How do I join the food garden?",
];

const CAPABILITIES = [
  "Finds real recycling, water refill, and waste points by building",
  "Reads out shuttle routes, stops, and running times",
  "Points to active green initiatives and how to join them",
  "Says when it doesn't know, instead of guessing",
];

const STACK = [
  ["React + Vite", "the chat interface"],
  ["Express", "a thin server that keeps the API key off the browser"],
  ["Claude Haiku 4.5", "answers questions, grounded only in real campus data"],
  ["A seeded JSON dataset", "sourced from UMP's own building directory"],
];

const LEARNED = [
  "Grounding a model in your own data beats letting it improvise",
  "A five-line system prompt rule does more work than a bigger model",
  "The dataset is the actual product, the chat UI is just the window",
];

function Home({ onStart }) {
  return (
    <div className="home">
      <p className="home-eyebrow">UMP Mbombela · Hackathon build</p>
      <h1 className="home-title">Lekgotla</h1>
      <p className="home-tagline">
        A campus sustainability assistant that answers in plain language,
        grounded in real UMP data instead of guesses.
      </p>

      <button className="cta" onClick={onStart}>
        Ask Lekgotla →
      </button>

      <section className="home-section">
        <h2>What it does</h2>
        <ul className="home-list">
          {CAPABILITIES.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="home-section">
        <h2>Built with</h2>
        <dl className="stack-list">
          {STACK.map(([name, note]) => (
            <div className="stack-row" key={name}>
              <dt>{name}</dt>
              <dd>{note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="home-section">
        <h2>What we learned</h2>
        <ul className="home-list">
          {LEARNED.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="home-section home-section--last">
        <h2>One more thing</h2>
        <p className="home-note">
          Ask it something outside the campus data, like the capital of
          France. It won't guess, it'll tell you that's outside what it
          covers. That refusal is deliberate: a wrong answer about a shuttle
          time is worse than no answer at all.
        </p>
      </section>

      <footer className="home-credits">
        <span>
          Built by <strong>Salt</strong> (Boni Chauke) &amp;{" "}
          <strong>Pepper</strong> (Lesedi Rapetsoa)
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text) {
    const question = text.trim();
    if (!question || pending) return;

    const next = [...messages, { role: "user", content: question }];
    setMessages(next);
    setDraft("");
    setError(null);
    setPending(true);

    try {
      let reply;

      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        reply =
          "The Library Forecourt Station takes plastic bottles, paper and cans. It is outside the main library entrance next to the bicycle racks, open 07:00 to 18:00 on weekdays.";
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        reply = data.reply;
      }

      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(
        "Could not reach the assistant. Check that the server is running on port 3001.",
      );
    } finally {
      setPending(false);
    }
  }

  function resetHome() {
    setView("home");
    setMessages([]);
    setDraft("");
    setError(null);
  }

  return (
    <div className="shell">
      <header className="masthead">
        <button
          className="mark"
          aria-label="Back to home"
          title="Back to home"
          onClick={resetHome}
        />
        <div>
          <h1>Lekgotla</h1>
          <p className="sub">
            Sustainability assistant · University of Mpumalanga, Mbombela
          </p>
        </div>
      </header>

      {view === "home" ? (
        <Home onStart={() => setView("chat")} />
      ) : (
        <>
      <main className="thread" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="opening">
            <p className="opening-line">
              Ask about recycling points, water refills, shuttle times, or how to
              join a campus green project.
            </p>
            <ul className="starters">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button className="starter" onClick={() => send(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m, i) => (
          <article key={i} className={`msg msg--${m.role}`}>
            <span className="who">
              {m.role === "user" ? "You" : "Lekgotla"}
            </span>
            <p>{m.content}</p>
          </article>
        ))}

        {pending && (
          <article className="msg msg--assistant">
            <span className="who">Lekgotla</span>
            <p className="thinking">
              <span />
              <span />
              <span />
            </p>
          </article>
        )}

        {error && <p className="error">{error}</p>}

        <div ref={endRef} />
      </main>

      <div className="composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(draft)}
          placeholder="Ask about campus sustainability"
          aria-label="Ask about campus sustainability"
          disabled={pending}
        />
        <button onClick={() => send(draft)} disabled={pending || !draft.trim()}>
          Ask
        </button>
      </div>
        </>
      )}
    </div>
  );
}
