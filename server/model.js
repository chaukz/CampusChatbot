// One function, two backends. Flip PROVIDER in .env when the wifi dies.
//
// messages: [{ role: "user" | "assistant", content: "..." }]
// returns:  string

const PROVIDER = process.env.PROVIDER || "anthropic";

export async function callModel(system, messages) {
  if (PROVIDER === "ollama") return callOllama(system, messages);
  return callAnthropic(system, messages);
}

async function callAnthropic(system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

async function callOllama(system, messages) {
  const res = await fetch(
    `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/chat`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2:3b",
        stream: false,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.message.content.trim();
}
