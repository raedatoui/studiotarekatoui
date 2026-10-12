'use client';

import { useEffect, useRef, useState } from 'react';
import { useSiteData } from '@/data/SiteDataProvider';
import type { ResearchInstance } from '@tarek/content';
import { mediaUrl } from '@/lib/mediaUrl';

/** Research lifelines and their dated appearances, followed by each thread in full. */

// Shared time scale. Years map into 0–92% so the right 8% reads as the "ongoing / now" zone.
// Marks sharing a year fan out around it, otherwise they stack into what reads as one dot.
// The gap is that year's own share of the axis, floored in px by CSS max() so a crowded
// year stays countable on a narrow track without having to measure it.
// A concluded project's final-year marks fan inward and stay before its end marker.
const MARK_GAP_PX = 12;
const fanMarks = (
    ms: ResearchInstance[],
    span: number,
    pos: (year: number) => number,
    concludedRange?: { startYear: number; endYear: number }
): Map<string, string> => {
    const byYear = new Map<number, ResearchInstance[]>();
    for (const m of ms) {
        byYear.set(m.year, [...(byYear.get(m.year) ?? []), m]);
    }
    const left = new Map<string, string>();
    for (const [year, group] of byYear) {
        const gap = 92 / span / (group.length + 1);
        const finalYear = concludedRange && year === concludedRange.endYear;
        let spacing = `max(${gap.toFixed(3)}%, ${MARK_GAP_PX}px)`;
        if (finalYear) {
            const maxGap = (pos(concludedRange.endYear) - pos(concludedRange.startYear)) / (group.length + 1);
            spacing = `min(${spacing}, ${maxGap.toFixed(3)}%)`;
        }
        group.forEach((m, i) => {
            const k = finalYear ? i - group.length : i - (group.length - 1) / 2;
            const offset = `${Math.abs(k)} * ${spacing}`;
            left.set(m.id, k === 0 ? `${pos(year)}%` : `calc(${pos(year)}% ${k < 0 ? '-' : '+'} ${offset})`);
        });
    }
    return left;
};

const SCORE_GRID = 'grid gap-x-[clamp(14px,2.4vw,32px)] sm:grid-cols-[150px_1fr] md:grid-cols-[210px_1fr]';

function Figure({ value, label }: { value: string; label: string }) {
    return (
        <li className="shrink-0">
            <span className="block font-mono text-[clamp(18px,2.1vw,28px)] leading-none">{value}</span>
            <span className="mt-2 block font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                {label}
            </span>
        </li>
    );
}

/** Hover card for a single project mark on the time axis. */
function MarkCard({ m, left }: { m: ResearchInstance; left: number }) {
    // Keep the card inside the track at both ends of the axis.
    const anchor = left < 15 ? 'translateX(0)' : left > 78 ? 'translateX(-100%)' : 'translateX(-50%)';
    const place = [m.city, m.country].filter(Boolean).join(', ');

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute bottom-[calc(100%+10px)] z-30 w-[min(268px,62vw)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
            style={{ left: `${left}%`, transform: anchor }}
        >
            <p className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {m.kind} · {m.year}
            </p>
            {m.title && (
                <p className="mt-2 font-[family-name:var(--font-display)] text-[length:calc(17px*var(--copy-scale))] leading-tight">{m.title}</p>
            )}
            <p className="mt-1.5 text-[length:calc(12.5px*var(--copy-scale))] font-light leading-snug">{m.organization}</p>
            {place && (
                <p className="text-[length:calc(12.5px*var(--copy-scale))] font-light leading-snug text-[var(--color-text-secondary)]">{place}</p>
            )}
            {m.dateDisplay && (
                <p className="mt-2 font-mono text-[length:calc(10px*var(--copy-scale))] text-[var(--color-text-secondary)]">{m.dateDisplay}</p>
            )}
        </div>
    );
}

export default function ProjectsHub() {
    const { research, researchPage, exportedAt } = useSiteData();
    const allInstances = research.flatMap((document) => document.instances);
    const [hovered, setHovered] = useState('');
    const [mark, setMark] = useState<{ researchId: string; m: ResearchInstance } | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const mainRef = useRef<HTMLElement>(null);

    const THIS_YEAR = new Date(exportedAt).getUTCFullYear();
    const allYears = allInstances.map((event) => event.year);
    const MIN_YEAR = Math.min(THIS_YEAR, ...research.map((t) => t.yearStart), ...allYears);
    const MAX_YEAR = Math.max(THIS_YEAR, ...research.map((t) => t.yearEnd ?? t.yearStart), ...allYears);
    const SPAN = Math.max(1, MAX_YEAR - MIN_YEAR);
    const ticks = Array.from(new Set(Array.from({ length: 6 }, (_, i) => Math.round(MIN_YEAR + (SPAN * i) / 5))));
    const pos = (year: number): number => ((year - MIN_YEAR) / SPAN) * 92;

    const tracks = research.map((document) => {
        const ms = document.instances;
        const years = ms.map((event) => event.year);
        // Include later appearances even when the research itself has concluded.
        const startYear = Math.min(document.yearStart, ...years);
        const endYear = document.ongoing ? MAX_YEAR : Math.max(document.yearEnd ?? document.yearStart, ...years);
        const places = Array.from(
            new Set([...ms].reverse().flatMap((event) => (event.city ? [event.country ? `${event.city}, ${event.country}` : event.city] : [])))
        );
        return {
            document,
            ms,
            marks: fanMarks(ms, SPAN, pos, document.ongoing ? undefined : { startYear, endYear }),
            startYear,
            endYear,
            places,
            live: ms.some((event) => event.status === 'current'),
        };
    });
    const distinctCities = new Set(allInstances.filter((event) => event.city).map((event) => `${event.city}, ${event.country ?? ''}`));

    // Both the score and reading panels follow CMS ordering.
    const threads = tracks;

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        }
    }, []);

    useEffect(() => {
        const updateBackToTop = () => setShowBackToTop(window.scrollY > window.innerHeight);
        updateBackToTop();
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        return () => window.removeEventListener('scroll', updateBackToTop);
    }, []);

    const goToThread = (id: string) => {
        document.getElementById(`thread-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goToTop = () => {
        mainRef.current?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };

    return (
        <main ref={mainRef} tabIndex={-1} className="bg-[var(--color-bg)] text-[var(--color-text)] outline-none">
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(40px,8vh,104px)] max-sm:pt-6 pb-[clamp(36px,5vw,64px)]">
                <p className="thread-rise font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-accent)]">
                    {researchPage.eyebrow}
                </p>
                <h1 className="thread-rise mt-[clamp(16px,2vw,28px)] whitespace-nowrap max-sm:whitespace-normal max-sm:text-balance font-[family-name:var(--font-display)] text-[min(3.25vw,47px)] max-sm:text-[clamp(32px,8vw,44px)] font-normal leading-[0.96] max-sm:leading-[1.1] tracking-[-0.01em] [animation-delay:80ms]">
                    {researchPage.heading}
                </h1>
                <div className="thread-rise mt-[clamp(24px,3vw,44px)] grid gap-[clamp(24px,4vw,72px)] md:grid-cols-[1fr_auto] md:items-end [animation-delay:160ms]">
                    <p className="max-w-[62ch] text-[length:calc(clamp(15px,1.3vw,18px)*var(--copy-scale))] font-light leading-[1.7] text-[var(--color-text-secondary)]">
                        {researchPage.introduction}
                    </p>
                    <ul className="flex flex-wrap gap-x-[clamp(22px,3vw,48px)] gap-y-5 md:justify-end">
                        <Figure value={research.length ? `${MIN_YEAR}→` : '—'} label="spanning" />
                        <Figure value={String(research.length)} label="projects" />
                        <Figure value={String(allInstances.length)} label="presentations" />
                        <Figure value={String(distinctCities.size)} label="places" />
                    </ul>
                </div>
            </section>

            {/* ── The score ──────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
                <div className="thread-rise flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                        Projects
                    </h2>
                    <p className="hidden gap-5 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:flex">
                        <span className="flex items-center gap-2">
                            <span className="h-px w-5 bg-[var(--color-accent)]" />
                            ongoing
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-[10px] w-[2px] bg-[var(--color-text-secondary)]" />
                            concluded
                        </span>
                    </p>
                </div>

                {/* axis */}
                <div className={`thread-rise mt-7 max-sm:hidden ${SCORE_GRID}`}>
                    <div className="hidden sm:block" />
                    <div className="relative h-4">
                        {ticks.map((y) => (
                            <span
                                key={y}
                                className="absolute -translate-x-1/2 font-mono text-[length:calc(10px*var(--copy-scale))] text-[var(--color-text-secondary)]"
                                style={{ left: `${pos(y)}%` }}
                            >
                                {y}
                            </span>
                        ))}
                    </div>
                </div>

                {/* tracks */}
                <div className="mt-4 sm:mt-1">
                    {tracks.map((t, i) => {
                        const active = hovered === t.document.id;
                        const left = pos(t.startYear);
                        const width = pos(t.endYear) - left;
                        return (
                            <button
                                key={t.document.id}
                                type="button"
                                onClick={() => goToThread(t.document.id)}
                                onMouseEnter={() => setHovered(t.document.id)}
                                onMouseLeave={() => setHovered('')}
                                onFocus={() => setHovered(t.document.id)}
                                onBlur={() => setHovered('')}
                                className={`relative block w-full cursor-pointer border-b border-[var(--color-border)] py-2 max-sm:py-3.5 text-left transition-colors ${SCORE_GRID} sm:items-center hover:bg-[var(--color-hover-bg)] ${active ? 'z-20' : ''}`}
                            >
                                {/* label */}
                                <div className="thread-rise flex flex-col items-start gap-1 sm:block" style={{ animationDelay: `${i * 55}ms` }}>
                                    <span
                                        className={`font-[family-name:var(--font-display)] text-[clamp(17px,1.5vw,23px)] max-sm:text-[clamp(22px,6vw,26px)] leading-tight transition-colors ${active ? 'text-[var(--color-accent)]' : ''}`}
                                    >
                                        {t.document.title}
                                    </span>
                                    <span className="flex items-center gap-2 font-mono text-[length:calc(10px*var(--copy-scale))] max-sm:text-[length:calc(11px*var(--copy-scale))] tracking-[0.1em] max-sm:tracking-[0.03em] text-[var(--color-text-secondary)] sm:mt-1 sm:block">
                                        {t.document.ongoing && (
                                            <span
                                                aria-hidden="true"
                                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)] sm:hidden"
                                            />
                                        )}
                                        {t.document.yearsDisplay}
                                    </span>
                                </div>

                                {/* track */}
                                <div className="relative mt-2 h-[clamp(28px,4.5vh,44px)] max-sm:hidden sm:mt-0">
                                    {/* gridlines (static, shared across rows) */}
                                    {ticks.map((y) => (
                                        <span
                                            key={y}
                                            aria-hidden
                                            className="absolute top-0 bottom-0 w-px bg-[var(--color-border)] opacity-40"
                                            style={{ left: `${pos(y)}%` }}
                                        />
                                    ))}

                                    {/* drawn lifeline */}
                                    <div className="thread-draw absolute inset-0" style={{ animationDelay: `${i * 55 + 120}ms` }}>
                                        {/* base line */}
                                        <span
                                            className={`absolute top-1/2 h-px -translate-y-1/2 transition-colors ${active ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-text)] opacity-30'}`}
                                            style={{ left: `${left}%`, width: `${width}%` }}
                                        />

                                        {/* ongoing tail → dissolves off the edge */}
                                        {t.document.ongoing && (
                                            <span
                                                className={`absolute top-1/2 h-px -translate-y-1/2 transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}
                                                style={{
                                                    left: `${pos(t.endYear)}%`,
                                                    right: 0,
                                                    background: 'linear-gradient(90deg, var(--color-accent), transparent)',
                                                }}
                                            />
                                        )}

                                        {/* project marks — this year's in light green, older ones gray */}
                                        {t.ms.map((m) => {
                                            const lit = mark?.researchId === t.document.id && mark.m.id === m.id;
                                            const size = lit ? 'h-[12px] w-[12px]' : active ? 'h-[8px] w-[8px]' : 'h-[6px] w-[6px]';
                                            const color = lit
                                                ? 'bg-[var(--color-accent)]'
                                                : m.year === THIS_YEAR
                                                  ? 'bg-[var(--color-recent)]'
                                                  : active
                                                    ? 'bg-[var(--color-accent)]'
                                                    : 'bg-[var(--color-text)] opacity-55';
                                            return (
                                                <span
                                                    key={m.id}
                                                    className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${size} ${color}`}
                                                    style={{ left: t.marks.get(m.id) ?? `${pos(m.year)}%` }}
                                                />
                                            );
                                        })}

                                        {/* end state */}
                                        {t.document.ongoing ? (
                                            t.ms.some((m) => m.year === THIS_YEAR) && (
                                                <span
                                                    className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] ${t.live ? 'thread-pulse' : ''}`}
                                                    style={{ left: `${pos(t.endYear)}%` }}
                                                />
                                            )
                                        ) : (
                                            <span
                                                className="absolute top-1/2 h-[12px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-text-secondary)]"
                                                style={{ left: `${pos(t.endYear)}%` }}
                                            />
                                        )}
                                    </div>

                                    {/* hover targets + card, outside .thread-draw so the draw animation never clips them */}
                                    {t.ms.map((m) => (
                                        <span
                                            key={`hit-${m.id}`}
                                            aria-hidden="true"
                                            onMouseEnter={() => setMark({ researchId: t.document.id, m })}
                                            onMouseLeave={() => setMark(null)}
                                            className="absolute top-0 bottom-0 z-20 w-[12px] -translate-x-1/2"
                                            style={{ left: t.marks.get(m.id) ?? `${pos(m.year)}%` }}
                                        />
                                    ))}
                                    {mark?.researchId === t.document.id && <MarkCard m={mark.m} left={pos(mark.m.year)} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── The threads, in full ───────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
                {threads.map((t) => {
                    const { document } = t;
                    return (
                        <article
                            key={document.id}
                            id={`thread-${document.id}`}
                            className="scroll-mt-[calc(var(--header-height,64px)+16px)] border-t border-[var(--color-border)] py-[clamp(40px,7vw,104px)] max-sm:last:pb-6 first:border-t-0 first:pt-[clamp(28px,4vw,48px)]"
                        >
                            <div className="flex items-center gap-3 font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.22em]">
                                {document.ongoing ? (
                                    <span className="flex items-center gap-2 text-[var(--color-accent)]">
                                        <span className={`h-[7px] w-[7px] rounded-full bg-[var(--color-accent)] ${t.live ? 'thread-pulse' : ''}`} />
                                        ongoing
                                    </span>
                                ) : (
                                    <span className="text-[var(--color-text-secondary)]">concluded</span>
                                )}
                                <span className="text-[var(--color-text-secondary)]">{document.yearsDisplay}</span>
                            </div>

                            <h3 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(36px,5.6vw,80px)] font-normal leading-[0.98] tracking-[-0.01em]">
                                <a href={`/research/${document.slug}`} className="transition-colors hover:text-[var(--color-accent)]">
                                    {document.title}
                                </a>
                            </h3>
                            {document.subtitle && (
                                <p className="mt-2 font-[family-name:var(--font-display)] text-[clamp(17px,2vw,26px)] italic text-[var(--color-text-secondary)]">
                                    {document.subtitle}
                                </p>
                            )}
                            <p className="mt-6 max-w-[58ch] text-[length:calc(clamp(16px,1.5vw,22px)*var(--copy-scale))] font-light leading-[1.55]">
                                {document.summary}
                            </p>

                            <div className="mt-[clamp(28px,4vw,56px)] grid items-start gap-[clamp(28px,4vw,56px)] lg:grid-cols-[1.45fr_1fr]">
                                <div>
                                    {document.heroImageURL && (
                                        <a href={`/research/${document.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]">
                                            <img
                                                src={mediaUrl(document.heroImageURL)}
                                                alt={document.title}
                                                loading="lazy"
                                                className="w-full object-cover aspect-[3/2]"
                                            />
                                        </a>
                                    )}
                                </div>

                                <aside>
                                    <dl>
                                        <Row label="Span" value={document.yearsDisplay} />
                                        {t.places.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                                    Places
                                                </dt>
                                                <dd className="font-mono text-[length:calc(12px*var(--copy-scale))] leading-relaxed">
                                                    {t.places.map((p) => p.split(',')[0]).join(' · ')}
                                                </dd>
                                            </div>
                                        )}
                                        {document.materials && document.materials.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                                    Material
                                                </dt>
                                                <dd className="flex flex-wrap gap-1.5">
                                                    {document.materials.map((mat) => (
                                                        <span
                                                            key={mat}
                                                            className="border border-[var(--color-border)] px-2 py-1 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]"
                                                        >
                                                            {mat}
                                                        </span>
                                                    ))}
                                                </dd>
                                            </div>
                                        )}
                                        {document.collaborators && document.collaborators.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                                    With
                                                </dt>
                                                <dd className="text-[length:calc(13px*var(--copy-scale))] font-light leading-relaxed">
                                                    {document.collaborators.join(', ')}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>

                                    {/* where & when — the thread's own path across time and space */}
                                    <div className="mt-1 border-t border-[var(--color-border)] pt-5">
                                        <p className="mb-4 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                            Where &amp; when
                                        </p>
                                        <ol className="space-y-3">
                                            {t.ms.map((m) => (
                                                <li key={m.id} className="grid grid-cols-[40px_1fr] items-baseline gap-3">
                                                    <span className="font-mono text-[length:calc(12px*var(--copy-scale))] text-[var(--color-accent)]">
                                                        {m.year}
                                                    </span>
                                                    <span className="text-[length:calc(13px*var(--copy-scale))] leading-snug">
                                                        {m.organization}
                                                        {m.city && (
                                                            <span className="text-[var(--color-text-secondary)]">
                                                                {' — '}
                                                                {m.city}
                                                                {m.country ? `, ${m.country}` : ''}
                                                            </span>
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    <a
                                        href={`/research/${document.slug}`}
                                        className="mt-7 inline-block font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-accent)] hover:underline underline-offset-4"
                                    >
                                        Explore the project →
                                    </a>
                                </aside>
                            </div>
                        </article>
                    );
                })}
            </section>
            {showBackToTop && (
                <button
                    type="button"
                    onClick={goToTop}
                    aria-label="Back to top"
                    title="Back to top"
                    className="fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-header-bg)] text-[var(--color-text)] opacity-90 transition-[color,opacity] hover:text-[var(--color-text)] hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] motion-reduce:transition-none"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M12 19V5m-6 6 6-6 6 6" />
                    </svg>
                </button>
            )}
        </main>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
            <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                {label}
            </dt>
            <dd className="text-[length:calc(14px*var(--copy-scale))] font-light">{value}</dd>
        </div>
    );
}
