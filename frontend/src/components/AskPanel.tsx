"use client";

import { FormEvent, useState } from "react";
import { api, AIAskResponse } from "@/lib/api";

export function AskPanel({ artistId }: { artistId?: string }) {
  const [question, setQuestion] = useState(
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
