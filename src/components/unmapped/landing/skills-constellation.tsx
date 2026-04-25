import * as React from "react";

/* Deterministic PRNG so SSR and CSR markup match — no hydration jitter. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Dot {
  x: number;
  y: number;
  r: number;
  opacity: number;
  duration: number; // s
  delay: number; // s
}

interface Edge {
  a: number;
  b: number;
  opacity: number;
}

const W = 720;
const H = 520;
const N = 72;
const CONNECT_DIST = 90;

function buildGraph(): { dots: Dot[]; edges: Edge[] } {
  const rand = mulberry32(20260425);
  const dots: Dot[] = [];
  // Padding so dots don't kiss the edges
  const padX = 32;
  const padY = 32;
  for (let i = 0; i < N; i++) {
    dots.push({
      x: padX + rand() * (W - padX * 2),
      y: padY + rand() * (H - padY * 2),
      r: 2 + rand() * 4, // 2–6px
      opacity: 0.2 + rand() * 0.8, // 0.2–1.0
      duration: 2 + rand() * 4, // 2–6s
      delay: rand() * 4, // 0–4s offset
    });
  }
  const edges: Edge[] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d = Math.hypot(dx, dy);
      if (d < CONNECT_DIST) {
        // Closer pairs get slightly more visible lines
        const op = 0.04 + (1 - d / CONNECT_DIST) * 0.12;
        edges.push({ a: i, b: j, opacity: op });
      }
    }
  }
  return { dots, edges };
}

const GRAPH = buildGraph();

export function SkillsConstellation({ className }: { className?: string }) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  // Pre-compute neighbour set for the hovered dot
  const neighbours = React.useMemo(() => {
    if (hovered == null) return null;
    const set = new Set<number>([hovered]);
    for (const e of GRAPH.edges) {
      if (e.a === hovered) set.add(e.b);
      else if (e.b === hovered) set.add(e.a);
    }
    return set;
  }, [hovered]);

  return (
    <svg
      role="img"
      aria-labelledby="constellation-title"
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={{ width: "100%", height: "auto", display: "block" }}
      onMouseLeave={() => setHovered(null)}
    >
      <title id="constellation-title">Skills network visualization</title>

      {/* Edges underneath dots */}
      <g stroke="var(--ink)" strokeWidth={0.5} strokeLinecap="round">
        {GRAPH.edges.map((e, i) => {
          const a = GRAPH.dots[e.a];
          const b = GRAPH.dots[e.b];
          const isHot =
            neighbours != null && neighbours.has(e.a) && neighbours.has(e.b);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              opacity={isHot ? Math.min(0.55, e.opacity * 4) : e.opacity}
              style={{ transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1)" }}
            />
          );
        })}
      </g>

      {/* Dots */}
      <g fill="var(--earth-dark)">
        {GRAPH.dots.map((d, i) => {
          const isHot = neighbours != null && neighbours.has(i);
          const op = isHot ? Math.min(1, d.opacity + 0.4) : d.opacity;
          return (
            <circle
              key={i}
              className="animate-pulse-dot motion-reduce:animate-none [transform-box:fill-box]"
              cx={d.x}
              cy={d.y}
              r={d.r}
              opacity={op}
              style={
                {
                  transformOrigin: `${d.x}px ${d.y}px`,
                  ["--dot-dur" as string]: `${d.duration}s`,
                  animationDelay: `${d.delay}s`,
                  transition: "opacity 280ms cubic-bezier(0.16,1,0.3,1)",
                  cursor: "pointer",
                } as React.CSSProperties
              }
              onMouseEnter={() => setHovered(i)}
            />
          );
        })}
      </g>
    </svg>
  );
}