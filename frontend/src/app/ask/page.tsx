import { Suspense } from "react";
import { AskQuery } from "@/components/AskQuery";

export default function AskPage() {
  return (
    <main className="page">
      <p className="eyebrow">Assistant</p>
      <h1>Ask the atlas</h1>
      <p className="lede">
        Questions are answered from the Neo4j knowledge graph and tiered{" "}
        <a href="/sources">source citations</a>. Add an <code>OPENAI_API_KEY</code> for LLM
        phrasing; without it you still get structured graph answers.
      </p>
      <Suspense fallback={<p className="panel-note">Loading…</p>}>
        <AskQuery />
      </Suspense>
    </main>
  );
}
