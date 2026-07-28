"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  MarkerType,
  useEdgesState,
  useNodesState,
} from "reactflow";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, GraphPayload } from "@/lib/api";
import "reactflow/dist/style.css";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type ViewMode = "atlas" | "generations" | "flow";
type PanelTab = "filters" | "groups" | "display" | "forces";
type ColorMode = "genre" | "generation";

const GENRE_COLORS: Record<string, string> = {
  Jazz: "#6b9ac4",
  "Afro Jazz": "#4a7c9b",
  "Afro Pop": "#e2b55a",
  Bubblegum: "#c45c2a",
  Kwaito: "#d4782f",
  "Hip Hop": "#8fbc8f",
  Amapiano: "#c9a227",
  Lekompo: "#b85c38",
  Gqom: "#9b59b6",
  Reggae: "#2ecc71",
  Soul: "#e74c8c",
  "World Music": "#1abc9c",
  Traditional: "#a0522d",
  "Sesotho Contemporary": "#7f8c8d",
  Motswako: "#2e86ab",
  Famo: "#a23b72",
  "Traditional Tswana": "#f18f01",
  "Traditional Sesotho Folk": "#c73e1d",
  "Sesotho Gospel": "#3b1f2b",
  "Sesotho Hip Hop": "#2a9d8f",
  Maskandi: "#264653",
  House: "#3498db",
  "Deep House": "#2980b9",
  Bacardi: "#5dade2",
  Mbaqanga: "#a67c52",
  "3-Step": "#f0b429",
  "SA Trap": "#95a5a6",
  "Afro Soul": "#e67e22",
  "Township Pop": "#cd853f",
};

const GEN_COLORS: Record<number, string> = {
  1: "#e2b55a",
  2: "#c45c2a",
  3: "#d4782f",
  4: "#6b9ac4",
  5: "#8fbc8f",
  6: "#9b59b6",
};

const GEN_LABELS: Record<number, string> = {
  1: "Gen 1 — Exile / jazz ambassadors",
  2: "Gen 2 — Fassie / Bayete / bubblegum",
  3: "Gen 3 — Kwaito",
  4: "Gen 4 — Lyric hip hop",
  5: "Gen 5 — Commercial rap",
  6: "Gen 6 — Amapiano / Lekompo",
};

const GEN_BAND_Y: Record<number, number> = {
  1: -220,
  2: -110,
  3: 0,
  4: 110,
  5: 220,
  6: 330,
};

function primaryGenre(genres: string[]): string {
  return genres[0] || "Other";
}

function colorForNode(
  genres: string[],
  generation: number | null | undefined,
  mode: ColorMode
): string {
  if (mode === "generation") {
    return generation ? GEN_COLORS[generation] || "#9aa892" : "#5a665c";
  }
  return GENRE_COLORS[primaryGenre(genres)] || "#9aa892";
}

type GraphNodeT = GraphPayload["nodes"][number];

function toFlow(
  data: { nodes: GraphNodeT[]; links: GraphPayload["links"] },
  showArrows: boolean,
  showLabels: boolean,
  colorMode: ColorMode,
  layered: boolean
): { nodes: Node[]; edges: Edge[] } {
  const byGen = new Map<number | "x", GraphNodeT[]>();
  data.nodes.forEach((n) => {
    const key = (n.generation as number) || "x";
    if (!byGen.has(key)) byGen.set(key, []);
    byGen.get(key)!.push(n);
  });

  const nodes: Node[] = [];
  if (layered) {
    Array.from(byGen.entries()).forEach(([gen, list]) => {
      list.forEach((n, i) => {
        const y = typeof gen === "number" ? GEN_BAND_Y[gen] ?? 400 : 420;
        nodes.push({
          id: n.id,
          position: { x: i * 170 - (list.length * 170) / 2, y },
          data: {
            label: `${n.label}${n.generation ? ` · G${n.generation}` : ""}`,
          },
          style: {
            background: "#1a261c",
            color: "#f3ead7",
            border: `2px solid ${colorForNode(n.genres, n.generation, colorMode)}`,
            borderRadius: 999,
            fontSize: 11,
            padding: "8px 12px",
            width: "auto",
            minWidth: 72,
            textAlign: "center" as const,
          },
        });
      });
    });
  } else {
    const cols = Math.ceil(Math.sqrt(data.nodes.length || 1));
    data.nodes.forEach((n, i) => {
      nodes.push({
        id: n.id,
        position: { x: (i % cols) * 200, y: Math.floor(i / cols) * 110 },
        data: { label: n.label },
        style: {
          background: "#1a261c",
          color: "#f3ead7",
          border: `2px solid ${colorForNode(n.genres, n.generation, colorMode)}`,
          borderRadius: 999,
          fontSize: 11,
          padding: "8px 12px",
          width: "auto",
          minWidth: 72,
          textAlign: "center" as const,
        },
      });
    });
  }

  const edges: Edge[] = data.links.map((l, i) => ({
    id: `e-${i}-${l.source}-${l.target}`,
    source: l.source,
    target: l.target,
    label: showLabels ? l.type.replaceAll("_", " ").toLowerCase() : undefined,
    markerEnd: showArrows ? { type: MarkerType.ArrowClosed, color: "#c45c2a" } : undefined,
    style: { stroke: "#c45c2a", strokeWidth: 1.2 },
    labelStyle: { fill: "#9aa892", fontSize: 9 },
  }));
  return { nodes, edges };
}

export function InfluenceGraph({ focusId }: { focusId?: string }) {
  const router = useRouter();
  const fgRef = useRef<{
    d3Force: (name: string, force?: unknown) => { strength?: (n: number) => unknown; distance?: (n: number) => unknown };
    zoomToFit: (ms?: number, padding?: number) => void;
  } | null>(null);

  const [raw, setRaw] = useState<GraphPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("generations");
  const [panel, setPanel] = useState<PanelTab>("filters");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [generationFilter, setGenerationFilter] = useState<number | "">("");
  const [enabledGens, setEnabledGens] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [hideOrphans, setHideOrphans] = useState(true);
  const [hideUngenerated, setHideUngenerated] = useState(false);
  const [linkType, setLinkType] = useState("");

  const [showArrows, setShowArrows] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [nodeScale, setNodeScale] = useState(1);
  const [linkWidth, setLinkWidth] = useState(1.2);
  const [colorMode, setColorMode] = useState<ColorMode>("generation");

  const [charge, setCharge] = useState(-90);
  const [linkDist, setLinkDist] = useState(55);
  const [centerStrength, setCenterStrength] = useState(0.12);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const load = useCallback((id?: string) => {
    setError(null);
    api
      .graph(id)
      .then(setRaw)
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    load(focusId);
  }, [focusId, load]);

  useEffect(() => {
    if (view === "generations") setColorMode("generation");
  }, [view]);

  const genres = useMemo(() => {
    if (!raw) return [];
    return Array.from(new Set(raw.nodes.flatMap((n) => n.genres))).sort((a, b) => a.localeCompare(b));
  }, [raw]);

  const linkTypes = useMemo(() => {
    if (!raw) return [];
    return Array.from(new Set(raw.links.map((l) => l.type))).sort((a, b) => a.localeCompare(b));
  }, [raw]);

  const filtered = useMemo(() => {
    if (!raw) return { nodes: [] as GraphNodeT[], links: [] as GraphPayload["links"] };
    const q = query.trim().toLowerCase();
    let next = raw.nodes.filter((n) => {
      if (q && !n.label.toLowerCase().includes(q) && !(n.city || "").toLowerCase().includes(q)) return false;
      if (genreFilter && !n.genres.includes(genreFilter)) return false;
      if (generationFilter !== "" && n.generation !== generationFilter) return false;
      if (view === "generations") {
        if (n.generation == null) return !hideUngenerated;
        if (!enabledGens.includes(n.generation)) return false;
      } else if (hideUngenerated && n.generation == null) {
        return false;
      }
      return true;
    });
    const ids = new Set(next.map((n) => n.id));
    let links = raw.links.filter((l) => {
      if (!ids.has(l.source) || !ids.has(l.target)) return false;
      if (linkType && l.type !== linkType) return false;
      return true;
    });
    if (hideOrphans) {
      const connected = new Set<string>();
      links.forEach((l) => {
        connected.add(l.source);
        connected.add(l.target);
      });
      next = next.filter((n) => connected.has(n.id) || (q && n.label.toLowerCase().includes(q)));
      const keep = new Set(next.map((n) => n.id));
      links = links.filter((l) => keep.has(l.source) && keep.has(l.target));
    }
    return { nodes: next, links };
  }, [
    raw,
    query,
    genreFilter,
    generationFilter,
    linkType,
    hideOrphans,
    hideUngenerated,
    enabledGens,
    view,
  ]);

  const neighborIds = useMemo(() => {
    if (!hoverId) return new Set<string>();
    const set = new Set<string>([hoverId]);
    filtered.links.forEach((l) => {
      if (l.source === hoverId) set.add(l.target);
      if (l.target === hoverId) set.add(l.source);
    });
    return set;
  }, [hoverId, filtered.links]);

  const forceData = useMemo(() => {
    const layered = view === "generations";
    return {
      nodes: filtered.nodes.map((n) => ({
        id: n.id,
        name: n.label,
        genres: n.genres,
        city: n.city,
        generation: n.generation ?? null,
        val: 1 + (n.genres?.length || 0) * 0.35 + (n.generation ? 0.5 : 0),
        // Pin Y by generation band in generations view
        fy: layered && n.generation ? GEN_BAND_Y[n.generation] : undefined,
      })),
      links: filtered.links.map((l) => ({
        source: l.source,
        target: l.target,
        type: l.type,
      })),
    };
  }, [filtered, view]);

  useEffect(() => {
    if (view !== "flow") return;
    const flow = toFlow(filtered, showArrows, showLabels, colorMode, false);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [view, filtered, showArrows, showLabels, colorMode, setNodes, setEdges]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || (view !== "atlas" && view !== "generations")) return;
    const chargeForce = fg.d3Force("charge") as { strength?: (n: number) => unknown } | undefined;
    const linkForce = fg.d3Force("link") as { distance?: (n: number) => unknown } | undefined;
    const centerForce = fg.d3Force("center") as { strength?: (n: number) => unknown } | undefined;
    chargeForce?.strength?.(charge);
    linkForce?.distance?.(linkDist);
    centerForce?.strength?.(view === "generations" ? centerStrength * 0.4 : centerStrength);
    // Refit after generation layout settles
    const t = window.setTimeout(() => fg.zoomToFit?.(500, 50), 600);
    return () => window.clearTimeout(t);
  }, [charge, linkDist, centerStrength, view, forceData]);

  function toggleGen(g: number) {
    setEnabledGens((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].sort((a, b) => a - b)
    );
  }

  if (error) return <p className="panel-note">{error}</p>;

  const useForce = view === "atlas" || view === "generations";

  return (
    <div className="obsidian-graph">
      <div className="graph-mode-tabs">
        <button type="button" className={view === "generations" ? "active" : ""} onClick={() => setView("generations")}>
          Generations
        </button>
        <button type="button" className={view === "atlas" ? "active" : ""} onClick={() => setView("atlas")}>
          Nodes
        </button>
        <button type="button" className={view === "flow" ? "active" : ""} onClick={() => setView("flow")}>
          Flow
        </button>
        <span className="graph-count">
          {filtered.nodes.length} nodes · {filtered.links.length} links
          {raw ? ` / ${raw.nodes.length}` : ""}
        </span>
        <button type="button" className="ghost-btn" onClick={() => load(undefined)}>
          Global
        </button>
        {focusId && (
          <Link href="/graph" className="ghost-btn">
            Clear focus
          </Link>
        )}
      </div>

      {view === "generations" && (
        <div className="gen-chip-row">
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <button
              key={g}
              type="button"
              className={enabledGens.includes(g) ? "gen-chip active" : "gen-chip"}
              style={{ ["--gen" as string]: GEN_COLORS[g] }}
              onClick={() => toggleGen(g)}
            >
              G{g}
            </button>
          ))}
        </div>
      )}

      <div className="obsidian-layout">
        <aside className="obsidian-panel">
          <div className="panel-tabs">
            {(["filters", "groups", "display", "forces"] as PanelTab[]).map((t) => (
              <button key={t} type="button" className={panel === t ? "active" : ""} onClick={() => setPanel(t)}>
                {t}
              </button>
            ))}
          </div>

          {panel === "filters" && (
            <div className="panel-body">
              <label>
                Search
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Artist or city…" />
              </label>
              <label>
                Generation
                <select
                  value={generationFilter}
                  onChange={(e) => setGenerationFilter(e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">All generations</option>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      {GEN_LABELS[g]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Genre
                <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                  <option value="">All genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Link type
                <select value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                  <option value="">All relationships</option>
                  {linkTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="check">
                <input type="checkbox" checked={hideOrphans} onChange={(e) => setHideOrphans(e.target.checked)} />
                Hide orphans
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={hideUngenerated}
                  onChange={(e) => setHideUngenerated(e.target.checked)}
                />
                Hide unassigned generation
              </label>
            </div>
          )}

          {panel === "groups" && (
            <div className="panel-body">
              <label>
                Color by
                <select value={colorMode} onChange={(e) => setColorMode(e.target.value as ColorMode)}>
                  <option value="generation">Generation</option>
                  <option value="genre">Genre</option>
                </select>
              </label>
              {colorMode === "generation" ? (
                <ul className="legend">
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <li key={g}>
                      <span style={{ background: GEN_COLORS[g] }} />
                      {GEN_LABELS[g]}
                    </li>
                  ))}
                  <li>
                    <span style={{ background: "#5a665c" }} />
                    Unassigned
                  </li>
                </ul>
              ) : (
                <ul className="legend">
                  {genres.slice(0, 14).map((g) => (
                    <li key={g}>
                      <span style={{ background: GENRE_COLORS[g] || "#9aa892" }} />
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {panel === "display" && (
            <div className="panel-body">
              <label className="check">
                <input type="checkbox" checked={showArrows} onChange={(e) => setShowArrows(e.target.checked)} />
                Directional arrows
              </label>
              <label className="check">
                <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
                Link / node labels
              </label>
              <label>
                Node size {nodeScale.toFixed(1)}
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={nodeScale}
                  onChange={(e) => setNodeScale(Number(e.target.value))}
                />
              </label>
              <label>
                Link thickness {linkWidth.toFixed(1)}
                <input
                  type="range"
                  min={0.4}
                  max={4}
                  step={0.2}
                  value={linkWidth}
                  onChange={(e) => setLinkWidth(Number(e.target.value))}
                />
              </label>
            </div>
          )}

          {panel === "forces" && (
            <div className="panel-body">
              <p className="panel-note">
                {view === "generations"
                  ? "Generations mode pins artists into horizontal era bands."
                  : "Applies to Nodes / Generations views."}
              </p>
              <label>
                Repel {charge}
                <input
                  type="range"
                  min={-300}
                  max={-10}
                  step={5}
                  value={charge}
                  onChange={(e) => setCharge(Number(e.target.value))}
                />
              </label>
              <label>
                Link distance {linkDist}
                <input
                  type="range"
                  min={20}
                  max={160}
                  step={5}
                  value={linkDist}
                  onChange={(e) => setLinkDist(Number(e.target.value))}
                />
              </label>
              <label>
                Center gravity {centerStrength.toFixed(2)}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={centerStrength}
                  onChange={(e) => setCenterStrength(Number(e.target.value))}
                />
              </label>
              <button type="button" className="ghost-btn" onClick={() => fgRef.current?.zoomToFit?.(400, 40)}>
                Fit view
              </button>
            </div>
          )}
        </aside>

        <div className="graph-canvas atlas-canvas">
          {view === "generations" && (
            <div className="gen-band-labels" aria-hidden>
              {[1, 2, 3, 4, 5, 6]
                .filter((g) => enabledGens.includes(g))
                .map((g) => (
                  <div key={g} className="gen-band-label" style={{ color: GEN_COLORS[g] }}>
                    G{g}
                  </div>
                ))}
            </div>
          )}

          {useForce && (
            <ForceGraph2D
              ref={fgRef as never}
              graphData={forceData}
              backgroundColor="#0c120e"
              nodeRelSize={4 * nodeScale}
              linkWidth={linkWidth}
              linkDirectionalArrowLength={showArrows ? 4 : 0}
              linkDirectionalArrowRelPos={1}
              linkColor={() => "rgba(196, 92, 42, 0.55)"}
              linkLabel={(l) =>
                showLabels ? String((l as { type?: string }).type || "").replaceAll("_", " ").toLowerCase() : ""
              }
              nodeLabel={(n) => {
                const node = n as {
                  name?: string;
                  genres?: string[];
                  city?: string;
                  generation?: number | null;
                };
                const city = node.city ? ` · ${node.city}` : "";
                const gen = node.generation ? ` · Gen ${node.generation}` : "";
                return `${node.name || ""}${city}${gen}\n${(node.genres || []).join(", ")}`;
              }}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n = node as {
                  id?: string | number;
                  name?: string;
                  genres?: string[];
                  generation?: number | null;
                  x?: number;
                  y?: number;
                  val?: number;
                };
                const id = String(n.id);
                const dim = Boolean(hoverId && !neighborIds.has(id));
                const color = colorForNode(n.genres || [], n.generation, colorMode);
                const r = Math.sqrt(n.val || 1) * 4 * nodeScale;
                ctx.beginPath();
                ctx.arc(n.x || 0, n.y || 0, r, 0, 2 * Math.PI, false);
                ctx.fillStyle = dim ? "rgba(154,168,146,0.25)" : color;
                ctx.fill();
                ctx.strokeStyle = dim ? "rgba(154,168,146,0.2)" : "#f3ead7";
                ctx.lineWidth = 0.8;
                ctx.stroke();
                if (showLabels && globalScale > 1.05) {
                  const label = n.name || "";
                  const fontSize = 12 / globalScale;
                  ctx.font = `${fontSize}px IBM Plex Sans, sans-serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";
                  ctx.fillStyle = dim ? "rgba(243,234,215,0.25)" : "#f3ead7";
                  ctx.fillText(label, n.x || 0, (n.y || 0) + r + 2);
                }
              }}
              onNodeHover={(node) => setHoverId(node?.id != null ? String(node.id) : null)}
              onNodeClick={(node) => {
                if (node?.id != null) router.push(`/artists/${node.id}`);
              }}
              cooldownTicks={100}
            />
          )}

          {view === "flow" && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              onNodeClick={(_, node) => router.push(`/artists/${node.id}`)}
            >
              <Background color="#2a3a2d" gap={20} />
              <Controls />
            </ReactFlow>
          )}
        </div>
      </div>

      {focusId && (
        <p className="panel-note">
          Local graph focused on one artist.{" "}
          <button type="button" className="ghost-btn" onClick={() => load(undefined)}>
            Switch to global
          </button>
        </p>
      )}
    </div>
  );
}
