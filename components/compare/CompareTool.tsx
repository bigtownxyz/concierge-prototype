"use client";

/* Compare tool — pick up to 3 programmes, see them side-by-side.
   State is mirrored in the URL (?programs=panama,portugal,dubai) so the
   chosen comparison is shareable and bookmarkable. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  PROGRAMS,
  REGIONS,
  programHasImage,
  type Program,
  type Region,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const SANS = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };
const SERIF = {
  fontFamily:
    "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif",
  fontStyle: "italic" as const,
};

const MAX_SLOTS = 3;
const QUERY_KEY = "programs";

const REGION_LABEL: Record<Region, string> = Object.fromEntries(
  REGIONS.map((r) => [r.value, r.label])
) as Record<Region, string>;

const REGION_GRADIENT: Record<Region, string> = {
  caribbean: "linear-gradient(140deg, #134e4a 0%, #0f766e 100%)",
  europe: "linear-gradient(140deg, #1e3a8a 0%, #312e81 100%)",
  middle_east: "linear-gradient(140deg, #78350f 0%, #92400e 100%)",
  africa: "linear-gradient(140deg, #7c2d12 0%, #9a3412 100%)",
  asia_pacific: "linear-gradient(140deg, #581c87 0%, #6b21a8 100%)",
  south_america: "linear-gradient(140deg, #14532d 0%, #166534 100%)",
  central_america: "linear-gradient(140deg, #713f12 0%, #854d0e 100%)",
  global: "linear-gradient(140deg, #1e293b 0%, #334155 100%)",
};

/* Convert a regional-indicator emoji like 🇵🇦 to its ISO 3166-1 alpha-2
   code ("pa"). Windows doesn't ship flag emoji glyphs, so we render real
   SVG images via flagcdn instead. Returns null for non-flag emojis. */
function emojiToIso(emoji: string): string | null {
  const points = Array.from(emoji);
  if (points.length !== 2) return null;
  const base = 0x1f1e6;
  const codes = points.map((p) => p.codePointAt(0) ?? 0);
  if (codes.some((c) => c < base || c > base + 25)) return null;
  return codes
    .map((c) => String.fromCharCode(c - base + 97))
    .join("");
}

function Flag({
  emoji,
  alt,
  className,
}: {
  emoji: string;
  alt: string;
  className?: string;
}) {
  const iso = emojiToIso(emoji);
  if (!iso) {
    return (
      <span className={className} aria-hidden>
        {emoji}
      </span>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`https://flagcdn.com/w80/${iso}.png`}
      srcSet={`https://flagcdn.com/w160/${iso}.png 2x`}
      width={32}
      height={24}
      alt={alt}
      loading="lazy"
      className={className}
    />
  );
}

function formatInvestment(p: Program) {
  if (p.minInvestment === 0 && (p.maxInvestment ?? 0) === 0) return "—";
  if (p.maxInvestment && p.maxInvestment > p.minInvestment) {
    return `${formatCurrency(p.minInvestment, p.currency)} – ${formatCurrency(p.maxInvestment, p.currency)}`;
  }
  return `From ${formatCurrency(p.minInvestment, p.currency)}`;
}

function formatTimeline(p: Program) {
  if (!p.processingTimeMonths) return "—";
  return `${p.processingTimeMonths} month${p.processingTimeMonths === 1 ? "" : "s"}`;
}

function formatVisaFree(p: Program) {
  if (p.visaFreeCount == null) return "—";
  return `${p.visaFreeCount}`;
}

/* ── Icons ─────────────────────────────────────────────────────────────── */

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

/* ── Slot card ─────────────────────────────────────────────────────────── */

function SlotCard({
  program,
  onRemove,
  onAdd,
}: {
  program: Program | null;
  onRemove?: () => void;
  onAdd?: () => void;
}) {
  if (!program) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="group flex h-full min-h-[12.5rem] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-[#9aa0b8] transition-colors hover:border-[#bbc4f7]/60 hover:bg-white/[0.04] hover:text-[#bbc4f7]"
        style={SANS}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-[#bbc4f7] transition-colors group-hover:border-[#bbc4f7]/55">
          <PlusIcon className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">Add programme</span>
        <span className="text-[0.72rem] uppercase tracking-[0.2em] text-[#7e828f]">
          Pick to compare
        </span>
      </button>
    );
  }

  const hasImage = programHasImage(program.slug);

  return (
    <article
      className="relative isolate flex h-full min-h-[12.5rem] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 px-6 py-5"
      style={{
        background: hasImage ? "#0f1320" : REGION_GRADIENT[program.region],
      }}
    >
      {hasImage && (
        <>
          <Image
            src={`/images/programs/${program.slug}.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="-z-10 object-cover opacity-50"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,13,20,0.45) 0%, rgba(11,13,20,0.85) 100%)",
            }}
          />
        </>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
        aria-label={`Remove ${program.country}`}
      >
        <CloseIcon className="h-4 w-4" />
      </button>

      <div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#bbc4f7]"
          style={SANS}
        >
          {program.type}
        </span>
        <h3
          className="mt-3 flex items-center gap-3 text-[1.55rem] text-white"
          style={{ ...SANS, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          <Flag
            emoji={program.flagEmoji}
            alt={`${program.country} flag`}
            className="h-7 w-10 shrink-0 rounded-[3px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
          />
          <span className="truncate">{program.country}</span>
        </h3>
        <p
          className="mt-1 text-[0.78rem] uppercase tracking-[0.18em] text-[#9aa0b8]"
          style={SANS}
        >
          {REGION_LABEL[program.region]}
        </p>
      </div>

      <dl
        className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-[0.78rem]"
        style={SANS}
      >
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8f93a3]">
            From
          </dt>
          <dd className="mt-0.5 font-semibold text-[#eef0f6]">
            {formatCurrency(program.minInvestment, program.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-[#8f93a3]">
            Timeline
          </dt>
          <dd className="mt-0.5 font-semibold text-[#eef0f6]">
            {formatTimeline(program)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

/* ── Programme picker (modal) ──────────────────────────────────────────── */

function ProgrammePicker({
  open,
  onClose,
  onPick,
  exclude,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (slug: string) => void;
  exclude: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROGRAMS.filter((p) => p.isActive)
      .filter((p) => !exclude.has(p.slug))
      .filter((p) => {
        if (!q) return true;
        return (
          p.country.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          REGION_LABEL[p.region].toLowerCase().includes(q)
        );
      });
  }, [query, exclude]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/70 px-4 py-12 backdrop-blur-sm sm:py-20"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#141826] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2
              className="text-[1.15rem] text-[#eef0f6]"
              style={{ ...SANS, fontWeight: 600 }}
            >
              Add a programme
            </h2>
            <p
              className="mt-0.5 text-[0.8rem] text-[#9aa0b8]"
              style={SANS}
            >
              Search by country, region, or type
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#c6c6cb] transition-colors hover:border-white/25 hover:text-white"
            aria-label="Close picker"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-5 pt-4">
          <SearchIcon className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f93a3]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programmes..."
            className="w-full rounded-xl border border-white/10 bg-[#0d1017] py-3 pl-11 pr-4 text-[0.95rem] text-[#eef0f6] placeholder:text-[#7e828f] focus:border-[#bbc4f7]/40 focus:outline-none"
            style={SANS}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {results.length === 0 ? (
            <p
              className="py-10 text-center text-sm text-[#9aa0b8]"
              style={SANS}
            >
              No programmes match &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {results.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => onPick(p.slug)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-[#bbc4f7]/40 hover:bg-white/[0.05]"
                  >
                    <Flag
                      emoji={p.flagEmoji}
                      alt={`${p.country} flag`}
                      className="h-6 w-9 shrink-0 rounded-[3px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-[0.95rem] font-semibold text-[#eef0f6]"
                        style={SANS}
                      >
                        {p.country}
                      </span>
                      <span
                        className="block truncate text-[0.72rem] uppercase tracking-[0.18em] text-[#8f93a3]"
                        style={SANS}
                      >
                        {p.type} · {REGION_LABEL[p.region]}
                      </span>
                    </span>
                    <PlusIcon className="h-4 w-4 shrink-0 text-[#8f93a3] transition-colors group-hover:text-[#bbc4f7]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Comparison rows ───────────────────────────────────────────────────── */

type Best = "min" | "max" | null;

function bestSlug(
  programs: Program[],
  value: (p: Program) => number | null,
  prefer: Best
): string | null {
  if (!prefer || programs.length < 2) return null;
  const numeric = programs
    .map((p) => ({ p, v: value(p) }))
    .filter((x): x is { p: Program; v: number } => x.v != null);
  if (numeric.length < 2) return null;
  const winner = numeric.reduce((acc, cur) => {
    if (prefer === "min") return cur.v < acc.v ? cur : acc;
    return cur.v > acc.v ? cur : acc;
  });
  // ties: don't highlight
  if (numeric.filter((x) => x.v === winner.v).length > 1) return null;
  return winner.p.slug;
}

function ComparisonRow({
  label,
  slots,
  render,
  bestFor,
  prefer = null,
}: {
  label: string;
  slots: (Program | null)[];
  render: (p: Program) => React.ReactNode;
  bestFor?: (p: Program) => number | null;
  prefer?: Best;
}) {
  const programs = slots.filter((p): p is Program => p !== null);
  const winner = bestFor ? bestSlug(programs, bestFor, prefer) : null;
  return (
    <div className="grid grid-cols-[7rem_repeat(var(--cols),minmax(13rem,1fr))] gap-px border-b border-white/[0.06] sm:grid-cols-[9rem_repeat(var(--cols),minmax(14rem,1fr))]">
      <div
        className="sticky left-0 z-10 bg-[#0d1017] px-4 py-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#8f93a3] sm:bg-white/[0.02] sm:px-5 sm:text-[0.72rem]"
        style={SANS}
      >
        {label}
      </div>
      {slots.map((p, i) => {
        if (!p) {
          return (
            <div
              key={`empty-${i}`}
              className="bg-[#0e1118]/20 px-4 py-4 text-[#4d5161] sm:px-5"
              style={SANS}
              aria-hidden
            >
              <span className="text-[0.95rem]">&mdash;</span>
            </div>
          );
        }
        const isWinner = winner === p.slug;
        return (
          <div
            key={p.slug}
            className="relative bg-[#0e1118]/40 px-4 py-4 text-[#eef0f6] sm:px-5"
            style={SANS}
          >
            {isWinner && (
              <span
                className="absolute left-2 top-1/2 inline-flex h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#bbc4f7] sm:left-3"
                aria-label="Best in row"
              />
            )}
            <div className={isWinner ? "pl-3" : undefined}>{render(p)}</div>
          </div>
        );
      })}
    </div>
  );
}

function RadarBar({ value, highlight = false }: { value: number; highlight?: boolean }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: highlight
              ? "linear-gradient(90deg, #bbc4f7, #c4caf1)"
              : "rgba(255,255,255,0.45)",
          }}
        />
      </div>
      <span
        className="w-10 shrink-0 text-right text-[0.85rem] font-semibold tabular-nums text-[#eef0f6]"
        style={SANS}
      >
        {pct}
      </span>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────────────── */

export function CompareTool() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hydrate initial slugs from URL once
  const initialSlugs = useMemo(() => {
    const raw = searchParams.get(QUERY_KEY) ?? "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => PROGRAMS.some((p) => p.slug === s))
      .slice(0, MAX_SLOTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sync state → URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.length === 0) {
      params.delete(QUERY_KEY);
    } else {
      params.set(QUERY_KEY, selected.join(","));
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const programs = useMemo(
    () =>
      selected
        .map((slug) => PROGRAMS.find((p) => p.slug === slug))
        .filter((p): p is Program => Boolean(p)),
    [selected]
  );

  const addProgramme = useCallback(
    (slug: string) => {
      setSelected((prev) => {
        if (prev.includes(slug) || prev.length >= MAX_SLOTS) return prev;
        return [...prev, slug];
      });
      setPickerOpen(false);
    },
    []
  );

  const removeProgramme = useCallback((slug: string) => {
    setSelected((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clearAll = useCallback(() => setSelected([]), []);

  const slots = useMemo<(Program | null)[]>(() => {
    const arr: (Program | null)[] = [...programs];
    while (arr.length < MAX_SLOTS) arr.push(null);
    return arr;
  }, [programs]);

  // Always render the full MAX_SLOTS columns so the comparison rows
  // stay column-aligned with the picker slot cards above (which always
  // show 3 cards: filled + empty placeholders).
  const colCount = MAX_SLOTS;

  return (
    <section className="relative w-full bg-[#0d1017] text-[#eef0f6]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgba(187,196,247,0.08), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[88rem] px-6 pb-24 pt-14 sm:px-8 lg:px-12 lg:pt-20">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2 lg:max-w-[42rem]">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#bbc4f7]" />
            <p
              className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#9aa0b8]"
              style={SANS}
            >
              Side-by-side comparison
            </p>
          </div>
          <h1
            className="mt-3 text-[#eef0f6]"
            style={{
              ...SANS,
              fontWeight: 500,
              fontSize: "clamp(2.4rem,5vw,4.4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            Compare{" "}
            <span className="text-[#c4caf1]" style={SERIF}>
              programmes
            </span>
          </h1>
          <p
            className="mt-4 max-w-[36rem] text-[#b9bccb]"
            style={{ ...SANS, fontSize: "1.0625rem", lineHeight: 1.65 }}
          >
            Pick up to three programmes to see investment, timeline,
            mobility, and lifestyle factors lined up the way an advisor
            would walk through them with you.
          </p>
        </div>

        {/* ── Slots ──────────────────────────────────────────────────── */}
        <div className="mt-12 flex items-center justify-between">
          <p
            className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f93a3]"
            style={SANS}
          >
            Programmes ({programs.length} of {MAX_SLOTS})
          </p>
          {programs.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[0.78rem] font-semibold text-[#9aa0b8] transition-colors hover:text-[#bbc4f7]"
              style={SANS}
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((p, i) => (
            <SlotCard
              key={p?.slug ?? `empty-${i}`}
              program={p}
              onAdd={() => setPickerOpen(true)}
              onRemove={p ? () => removeProgramme(p.slug) : undefined}
            />
          ))}
        </div>

        {/* ── Comparison table ───────────────────────────────────────── */}
        {programs.length === 0 ? (
          <div
            className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-16 text-center"
            style={SANS}
          >
            <p className="text-[1.05rem] text-[#c6c6cb]">
              Add at least one programme to start comparing.
            </p>
            <p className="mt-1.5 text-[0.9rem] text-[#8f93a3]">
              You can pick up to three. The URL updates as you go, so the
              link is shareable.
            </p>
          </div>
        ) : (
          <div
            className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1017]"
            style={{ ["--cols" as string]: String(colCount) }}
          >
            <p
              className="border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-center text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#8f93a3] sm:hidden"
              style={SANS}
            >
              Swipe to compare ↔
            </p>
            <div className="overflow-x-auto">
            <ComparisonRow
              label="Investment"
              slots={slots}
              render={(p) => (
                <span className="font-semibold">{formatInvestment(p)}</span>
              )}
              bestFor={(p) => p.minInvestment || null}
              prefer="min"
            />
            <ComparisonRow
              label="Timeline"
              slots={slots}
              render={(p) => (
                <span className="font-semibold">{formatTimeline(p)}</span>
              )}
              bestFor={(p) => p.processingTimeMonths}
              prefer="min"
            />
            <ComparisonRow
              label="Visa-free"
              slots={slots}
              render={(p) => (
                <span>
                  <span className="font-semibold">{formatVisaFree(p)}</span>
                  {p.visaFreeCount != null && (
                    <span className="ml-1 text-[0.78rem] text-[#9aa0b8]">
                      countries
                    </span>
                  )}
                </span>
              )}
              bestFor={(p) => p.visaFreeCount}
              prefer="max"
            />
            <ComparisonRow
              label="Region"
              slots={slots}
              render={(p) => (
                <span className="text-[#dfe2eb]">
                  {REGION_LABEL[p.region]}
                </span>
              )}
            />
            <ComparisonRow
              label="Cost score"
              slots={slots}
              render={(p) => (
                <RadarBar
                  value={p.radarScores.cost_score}
                  highlight={
                    bestSlug(
                      programs,
                      (x) => x.radarScores.cost_score,
                      "max"
                    ) === p.slug
                  }
                />
              )}
              bestFor={(p) => p.radarScores.cost_score}
              prefer="max"
            />
            <ComparisonRow
              label="Speed score"
              slots={slots}
              render={(p) => (
                <RadarBar
                  value={p.radarScores.speed_score}
                  highlight={
                    bestSlug(
                      programs,
                      (x) => x.radarScores.speed_score,
                      "max"
                    ) === p.slug
                  }
                />
              )}
              bestFor={(p) => p.radarScores.speed_score}
              prefer="max"
            />
            <ComparisonRow
              label="Lifestyle"
              slots={slots}
              render={(p) => (
                <RadarBar
                  value={p.radarScores.lifestyle_score}
                  highlight={
                    bestSlug(
                      programs,
                      (x) => x.radarScores.lifestyle_score,
                      "max"
                    ) === p.slug
                  }
                />
              )}
              bestFor={(p) => p.radarScores.lifestyle_score}
              prefer="max"
            />
            <ComparisonRow
              label="Tax"
              slots={slots}
              render={(p) => (
                <RadarBar
                  value={p.radarScores.tax_score}
                  highlight={
                    bestSlug(
                      programs,
                      (x) => x.radarScores.tax_score,
                      "max"
                    ) === p.slug
                  }
                />
              )}
              bestFor={(p) => p.radarScores.tax_score}
              prefer="max"
            />
            <ComparisonRow
              label="Travel"
              slots={slots}
              render={(p) => (
                <RadarBar
                  value={p.radarScores.travel_score}
                  highlight={
                    bestSlug(
                      programs,
                      (x) => x.radarScores.travel_score,
                      "max"
                    ) === p.slug
                  }
                />
              )}
              bestFor={(p) => p.radarScores.travel_score}
              prefer="max"
            />
            <ComparisonRow
              label="Benefits"
              slots={slots}
              render={(p) => (
                <ul className="space-y-1.5">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#bbc4f7]" />
                      <span className="text-[0.9rem] text-[#dfe2eb]">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            />
            <ComparisonRow
              label="Requirements"
              slots={slots}
              render={(p) => (
                <ul className="space-y-1.5">
                  {p.requirements.map((r) => (
                    <li
                      key={r}
                      className="text-[0.9rem] text-[#c6c6cb] before:mr-2 before:text-[#8f93a3] before:content-['•']"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            />
            <ComparisonRow
              label="Overview"
              slots={slots}
              render={(p) => (
                <p
                  className="text-[0.92rem] leading-relaxed text-[#c6c6cb]"
                  style={SANS}
                >
                  {p.marketingHook}
                </p>
              )}
            />

            {/* CTA footer */}
            <div className="grid grid-cols-[7rem_repeat(var(--cols),minmax(13rem,1fr))] gap-px sm:grid-cols-[9rem_repeat(var(--cols),minmax(14rem,1fr))]">
              <div className="sticky left-0 z-10 bg-[#0d1017] px-4 py-5 sm:bg-white/[0.02] sm:px-5" />
              {slots.map((p, i) =>
                p ? (
                  <div
                    key={p.slug}
                    className="bg-[#0e1118]/40 px-4 py-5 sm:px-5"
                  >
                    <Link
                      href={`/programs/${p.slug}`}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#bbc4f7] px-4 py-2.5 text-[0.85rem] font-semibold text-[#242d58] transition-colors hover:bg-[#cbd1fa]"
                      style={SANS}
                    >
                      Open {p.country}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                ) : (
                  <div
                    key={`empty-cta-${i}`}
                    className="bg-[#0e1118]/20 px-4 py-5 sm:px-5"
                    aria-hidden
                  />
                )
              )}
            </div>
            </div>
          </div>
        )}
      </div>

      <ProgrammePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={addProgramme}
        exclude={new Set(selected)}
      />
    </section>
  );
}
