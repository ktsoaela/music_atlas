"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import type { AIAskResponse } from "@/types/ai";

const QUICK_QUESTIONS = [
  "Who inspired HHP?",
  "How did Kwaito begin?",
  "Why is Chicco Twala important?",
  "Show every artist from Limpopo",
];

export function AskPanel({
  artistId,
  initialQuestion,
}: {
  artistId?: string;
  initialQuestion?: string;
}) {
  const [question, setQuestion] = useState(
    initialQuestion?.trim() ||
      "Who inspired ProKid, and how does Cape Town hip hop connect to Gauteng?"
  );
  const [result, setResult] = useState<AIAskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setResult(await api.ask(question, artistId));
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ask-panel">
      <form onSubmit={onSubmit} className="ask-form">
        <label htmlFor="q">Ask the atlas</label>
        <textarea
          id="q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? "Searching graph…" : "Ask"}
        </button>
      </form>
      <div className="quick-ask">
        {QUICK_QUESTIONS.map((prompt) => (
          <button key={prompt} type="button" onClick={() => setQuestion(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      {error && <p className="panel-note">{error}</p>}
      {result && (
        <div className="ask-result">
          <p className="eyebrow">Answer · {result.mode}</p>
          <div className="ask-answer">{result.answer}</div>
          <p className="eyebrow">Sources ({result.sources.length})</p>
          <ul className="plain-list">
            {result.sources.map((s, i) => (
              <li key={i}>
                <span>{String(s.name || s.type)}</span>
                <span>{String(s.type)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
