import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  ChevronRight,
  Download,
  Flame,
  Headphones,
  Lock,
  Play,
  Sparkles,
  Timer,
  Wifi,
  WifiOff,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  learnData,
  type PathwayModule,
  type Lesson,
} from "./learn-data";

/* -----------------------------------------------------------
 * LearnBoard — the personalised learning hub for Youth mode.
 * Concept: "Pathway to your next opportunity" — modules are
 * ordered along a visible journey, each linked back to the
 * profile cluster + ISCO match it strengthens.
 * --------------------------------------------------------- */

export function LearnBoard() {
  const d = learnData;
  const [openId, setOpenId] = React.useState<string>(d.modules[0].id);
  const [downloaded, setDownloaded] = React.useState<Set<string>>(new Set());
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const overallProgress = Math.round(
    d.modules.reduce((sum, m) => sum + m.progress, 0) / d.modules.length,
  );
  const minutesPct = Math.min(
    100,
    Math.round((d.weeklyMinutes / d.weeklyTarget) * 100),
  );

  return (
    <div className="space-y-8">
      {/* ============== HERO ============== */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-raised p-6 md:p-8 shadow-[var(--shadow-sm)] animate-rise-in opacity-0"
        style={{ animationDelay: "0ms" }}
      >
        {/* parchment grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply bg-[length:240px_240px] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]"
        />
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="text-[12px] font-mono uppercase tracking-[0.08em] text-earth-dark">
              Welcome back, {d.learnerFirstName}
            </p>
            <h2 className="mt-2 font-display text-[28px] md:text-[34px] leading-[1.05] tracking-tight text-ink [font-variation-settings:'opsz'_144,'wght'_400]">
              Keep building toward<br />
              <span className="text-earth-dark">{d.pathwayTitle.replace("Pathway to ", "")}</span>
            </h2>
            <p className="mt-3 max-w-[52ch] text-[14px] text-ink-secondary leading-relaxed">
              {d.pathwayCaption}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatChip
                icon={<Flame size={13} />}
                label="Streak"
                value={`${d.streakDays} days`}
                tone="warm"
              />
              <StatChip
                icon={<Award size={13} />}
                label="Credentials"
                value={`${d.totalCredentials} earned`}
              />
              <StatChip
                icon={<Sparkles size={13} />}
                label="Modules done"
                value={`${d.modulesCompleted} / ${d.modules.length}`}
              />
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-mono",
                  online
                    ? "border-signal-green/30 bg-signal-green/10 text-signal-green"
                    : "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
                )}
                aria-live="polite"
              >
                {online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {online ? "Online" : "Offline · using saved lessons"}
              </span>
            </div>
          </div>

          {/* Right: weekly minutes ring */}
          <div className="flex items-center justify-center md:justify-end">
            <Ring
              percent={minutesPct}
              centerTop={`${d.weeklyMinutes}`}
              centerBottom={`/ ${d.weeklyTarget} min`}
              footnote="this week"
            />
          </div>
        </div>
      </section>

      {/* ============== PATHWAY ============== */}
      <section
        aria-labelledby="pathway-h"
        className="animate-rise-in opacity-0"
        style={{ animationDelay: "120ms" }}
      >
        <header className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h2
              id="pathway-h"
              className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-tertiary"
            >
              Your pathway
            </h2>
            <p className="mt-1 font-display text-[20px] tracking-tight text-ink [font-variation-settings:'opsz'_144,'wght'_400]">
              3 modules · {overallProgress}% complete
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-ink-tertiary font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-earth" />
            in progress
            <span className="h-1.5 w-1.5 rounded-full bg-signal-green ml-3" />
            done
            <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary/40 ml-3" />
            locked
          </div>
        </header>

        {/* Pathway rail */}
        <div className="relative">
          {/* connecting line */}
          <div
            aria-hidden
            className="absolute left-4 right-4 top-[26px] h-[2px] bg-gradient-to-r from-signal-green via-earth to-border-subtle md:left-8 md:right-8"
          />
          <div className="relative grid gap-4 md:grid-cols-3">
            {d.modules.map((m, i) => {
              const prev = i === 0 ? null : d.modules[i - 1];
              const locked = prev ? prev.progress < 100 && m.progress === 0 : false;
              return (
                <PathwayNode
                  key={m.id}
                  module={m}
                  open={openId === m.id}
                  locked={locked}
                  downloaded={downloaded.has(m.id)}
                  onToggle={() => setOpenId(openId === m.id ? "" : m.id)}
                  onDownload={() => {
                    setDownloaded((prev) => {
                      const next = new Set(prev);
                      next.has(m.id) ? next.delete(m.id) : next.add(m.id);
                      return next;
                    });
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {openId && (
          <ModuleDetail
            key={openId}
            module={d.modules.find((m) => m.id === openId)!}
          />
        )}
      </section>

      {/* ============== SKILL GAP + BITES ============== */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div
          className="rounded-3xl border border-border-subtle bg-surface-raised p-5 md:p-6 shadow-[var(--shadow-sm)] animate-rise-in opacity-0"
          style={{ animationDelay: "240ms" }}
        >
          <header className="flex items-baseline justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
                Gaps to close
              </h2>
              <p className="mt-1 font-display text-[20px] tracking-tight text-ink [font-variation-settings:'opsz'_144,'wght'_400]">
                What unlocks your next match
              </p>
            </div>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1 text-[12px] text-earth-dark font-medium hover:underline"
            >
              See matches
              <ChevronRight size={13} />
            </Link>
          </header>

          <ul className="space-y-3">
            {d.gaps.map((g, i) => (
              <li
                key={g.skill}
                className="rounded-2xl border border-border-subtle bg-surface-sunken/40 p-4 transition-colors hover:bg-surface-sunken/70"
                style={{ animationDelay: `${280 + i * 60}ms` }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[14px] font-medium text-ink">{g.skill}</h3>
                  <span className="font-mono text-[11px] tabular-nums text-ink-tertiary">
                    {g.delta}% to ready
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-ink-secondary leading-relaxed">
                  {g.reason}
                </p>
                <div className="mt-3 relative h-[5px] w-full bg-surface-sunken rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-earth to-earth-dark rounded-full transition-[width] duration-700 ease-precision"
                    style={{ width: `${g.delta}%` }}
                  />
                </div>
                <p className="mt-2.5 text-[11px] text-earth-dark inline-flex items-center gap-1">
                  <Lock size={11} />
                  Unlocks: <span className="font-medium">{g.jobUnlock}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Bite-sized */}
        <div
          className="rounded-3xl border border-border-subtle bg-surface-raised p-5 md:p-6 shadow-[var(--shadow-sm)] animate-rise-in opacity-0"
          style={{ animationDelay: "320ms" }}
        >
          <header className="mb-4">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-tertiary">
              Bite-sized
            </h2>
            <p className="mt-1 font-display text-[20px] tracking-tight text-ink [font-variation-settings:'opsz'_144,'wght'_400]">
              5 minutes between jobs
            </p>
          </header>

          <ul className="space-y-2.5">
            {d.bites.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="group flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-surface-sunken/40 px-3.5 py-3 text-left transition-all hover:bg-earth-light hover:border-earth/30 hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-raised border border-border-subtle text-[18px]"
                  >
                    {b.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink leading-snug truncate">
                      {b.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-tertiary font-mono inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Timer size={10} />
                        {b.minutes} min
                      </span>
                      <span aria-hidden>·</span>
                      <span>{b.tag}</span>
                    </p>
                  </div>
                  <Play
                    size={14}
                    className="text-ink-tertiary group-hover:text-earth-dark transition-colors shrink-0"
                  />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-2xl border border-dashed border-border-strong bg-surface-sunken/30 p-3 flex items-start gap-2">
            <Headphones size={14} className="mt-0.5 text-earth-dark shrink-0" />
            <p className="text-[11px] text-ink-secondary leading-relaxed">
              All bites work offline once opened — perfect for low-data days.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============= sub-components ============= */

function StatChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "warm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]",
        tone === "warm"
          ? "border-signal-amber/30 bg-signal-amber/10 text-signal-amber"
          : "border-border-subtle bg-surface-sunken text-ink-secondary",
      )}
    >
      {icon}
      <span className="font-mono uppercase tracking-[0.06em] text-[10px] opacity-80">
        {label}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </span>
  );
}

function Ring({
  percent,
  centerTop,
  centerBottom,
  footnote,
}: {
  percent: number;
  centerTop: string;
  centerBottom: string;
  footnote: string;
}) {
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--surface-sunken)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--earth-dark)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[34px] leading-none text-ink tabular-nums [font-variation-settings:'opsz'_144,'wght'_400]">
          {centerTop}
        </span>
        <span className="mt-1 text-[11px] text-ink-tertiary font-mono">
          {centerBottom}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.08em] text-earth-dark">
          {footnote}
        </span>
      </div>
    </div>
  );
}

function PathwayNode({
  module: m,
  open,
  locked,
  downloaded,
  onToggle,
  onDownload,
}: {
  module: PathwayModule;
  open: boolean;
  locked: boolean;
  downloaded: boolean;
  onToggle: () => void;
  onDownload: () => void;
}) {
  const done = m.progress === 100;
  const inProgress = m.progress > 0 && m.progress < 100;
  return (
    <article
      className={cn(
        "relative rounded-2xl border bg-surface-raised p-4 shadow-[var(--shadow-sm)] transition-all",
        open
          ? "border-earth shadow-[var(--shadow-md)] -translate-y-0.5"
          : "border-border-subtle hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        locked && "opacity-60",
      )}
    >
      {/* node circle on top of the rail */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "relative z-[1] inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface-raised font-mono text-[12px] font-medium tabular-nums shrink-0",
            done && "bg-signal-green text-white",
            inProgress && "bg-earth text-ink",
            !done && !inProgress && "bg-surface-sunken text-ink-tertiary",
          )}
        >
          {done ? <Check size={14} strokeWidth={2.5} /> : locked ? <Lock size={12} /> : m.step}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-tertiary">
            {m.level} · {m.totalMinutes}m
          </p>
          <h3 className="text-[14px] font-medium text-ink leading-snug truncate">
            {m.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-ink-secondary leading-relaxed line-clamp-2">
        {m.blurb}
      </p>

      <div className="mt-3 relative h-[4px] w-full bg-surface-sunken rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-precision",
            done ? "bg-signal-green" : "bg-earth",
          )}
          style={{ width: `${m.progress}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-ink-tertiary tabular-nums">
        <span>{m.progress}%</span>
        <span className="text-earth-dark">{m.iscoLink}</span>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggle}
          disabled={locked}
          className={cn(
            "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-medium transition-all",
            locked
              ? "bg-surface-sunken text-ink-tertiary cursor-not-allowed"
              : open
                ? "bg-earth-dark text-earth-light"
                : "bg-earth text-ink hover:shadow-sm",
          )}
        >
          {locked ? "Locked" : done ? "Review" : inProgress ? "Continue" : "Start"}
          {!locked && <Play size={11} strokeWidth={2} />}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={locked}
          aria-label={downloaded ? "Downloaded for offline" : "Download for offline"}
          aria-pressed={downloaded}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
            downloaded
              ? "border-signal-green/40 bg-signal-green/10 text-signal-green"
              : "border-border-subtle text-ink-tertiary hover:bg-surface-sunken",
            locked && "opacity-50 cursor-not-allowed",
          )}
          title={`${(m.offlineKb / 1024).toFixed(1)} MB offline`}
        >
          {downloaded ? <Check size={13} strokeWidth={2.2} /> : <Download size={13} />}
        </button>
      </div>
    </article>
  );
}

function ModuleDetail({ module: m }: { module: PathwayModule }) {
  const completed = m.lessons.filter((l) => l.done).length;
  return (
    <div
      className="mt-4 rounded-3xl border border-earth/30 bg-earth-light/40 p-5 md:p-6 animate-rise-in opacity-0"
      style={{ animationDelay: "60ms" }}
    >
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-earth-dark">
            Module {m.step} · {m.cluster}
          </p>
          <h3 className="mt-1 font-display text-[22px] tracking-tight text-ink leading-tight [font-variation-settings:'opsz'_144,'wght'_400]">
            {m.title}
          </h3>
          <p className="mt-2 text-[13px] text-ink-secondary leading-relaxed max-w-[60ch]">
            {m.blurb}
          </p>

          <ol className="mt-5 space-y-1.5">
            {m.lessons.map((l, i) => (
              <LessonRow key={i} lesson={l} index={i + 1} />
            ))}
          </ol>
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl bg-surface-raised border border-border-subtle p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-tertiary font-mono">
              You earn
            </p>
            <div className="mt-2 inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-earth text-earth-dark">
                <Award size={16} strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink leading-tight">
                  {m.credential}
                </p>
                <p className="text-[11px] text-ink-tertiary font-mono">
                  ESCO-aligned · portable
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-raised border border-border-subtle p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-tertiary font-mono">
              Then unlocks
            </p>
            <p className="mt-1.5 text-[13px] text-ink leading-snug">{m.unlocks}</p>
          </div>

          <div className="rounded-2xl bg-surface-raised border border-border-subtle p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-tertiary font-mono">
              Lessons
            </p>
            <p className="mt-1.5 font-display text-[24px] leading-none text-ink tabular-nums [font-variation-settings:'opsz'_144,'wght'_400]">
              {completed}<span className="text-ink-tertiary text-[16px]"> / {m.lessons.length}</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-tertiary">
              {m.totalMinutes} min total · {(m.offlineKb / 1024).toFixed(1)} MB offline
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonRow({ lesson: l, index }: { lesson: Lesson; index: number }) {
  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        l.done
          ? "bg-surface-raised/60"
          : "bg-surface-raised hover:bg-surface-raised/80 cursor-pointer",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-mono tabular-nums",
          l.done
            ? "bg-signal-green/15 text-signal-green"
            : "bg-surface-sunken text-ink-tertiary",
        )}
      >
        {l.done ? <Check size={12} strokeWidth={2.5} /> : index}
      </span>
      <span
        className={cn(
          "flex-1 text-[13px] leading-tight",
          l.done ? "text-ink-tertiary line-through decoration-1" : "text-ink",
        )}
      >
        {l.title}
      </span>
      <span className="font-mono text-[11px] text-ink-tertiary tabular-nums shrink-0 inline-flex items-center gap-1">
        <Timer size={10} />
        {l.minutes}m
      </span>
    </li>
  );
}
