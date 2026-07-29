export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

type GetOptions = {
  /** Seconds to let Next's server-side data cache serve a stale copy. `false` = always fresh. */
  revalidate?: number | false;
};

/**
 * Server Components / server-side callers get cached, deduped fetches (fast repeat
 * navigations, one Neo4j round trip per revalidate window). Client Components ignore
 * `next.revalidate` entirely (Next only honors it during server rendering), so calls
 * made from "use client" code always hit the network fresh, same as before this split.
 */
export async function apiGet<T>(path: string, { revalidate = 60 }: GetOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: revalidate === false ? undefined : { revalidate },
    cache: revalidate === false ? "no-store" : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}
