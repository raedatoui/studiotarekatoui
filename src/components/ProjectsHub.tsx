'use client';

import { useEffect, useState } from 'react';
import { useSiteData } from '@/data/SiteDataProvider';
import type { ResearchEvent } from '@/data/schema';
import { mediaUrl } from '@/lib/mediaUrl';

/** Research lifelines and their dated appearances, followed by each thread in full. */

// Shared time scale. Years map into 0–92% so the right 8% reads as the "ongoing / now" zone.
const TICKS = [2011, 2014, 2017, 2020, 2023, 2026];
// Marks sharing a year fan out around it, otherwise they stack into what reads as one dot.
// The gap is that year's own share of the axis, floored in px by CSS max() so a crowded
// year stays countable on a narrow track without having to measure it.
const MARK_GAP_PX = 12;
const fanMarks = (ms: ResearchEvent[], span: number, pos: (year: number) => number): Map<string, string> => {
    const byYear = new Map<number, ResearchEvent[]>();
    for (const m of ms) {
        byYear.set(m.year, [...(byYear.get(m.year) ?? []), m]);
    }
    const left = new Map<string, string>();
    for (const [year, group] of byYear) {
        const gap = 92 / span / (group.length + 1);
        group.forEach((m, i) => {
            const k = i - (group.length - 1) / 2;
            const offset = `${Math.abs(k)} * max(${gap.toFixed(3)}%, ${MARK_GAP_PX}px)`;
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
function MarkCard({ m, left }: { m: ResearchEvent; left: number }) {
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
            <p className="mt-1.5 text-[length:calc(12.5px*var(--copy-scale))] font-light leading-snug">{m.venue}</p>
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
    const { themes, researchEvents } = useSiteData();
    const [hovered, setHovered] = useState('');
    const [mark, setMark] = useState<{ themeId: string; m: ResearchEvent } | null>(null);

    const sortedThemes = [...themes].sort((a, b) => a.yearStart - b.yearStart);
    const allYears = researchEvents.map((event) => event.year);
    const MIN_YEAR = Math.min(...sortedThemes.map((t) => t.yearStart), ...allYears);
    const THIS_YEAR = new Date().getFullYear();
    const MAX_YEAR = Math.max(THIS_YEAR, ...sortedThemes.map((t) => t.yearEnd ?? t.yearStart), ...allYears);
    const SPAN = MAX_YEAR - MIN_YEAR;
    const pos = (year: number): number => ((year - MIN_YEAR) / SPAN) * 92;

    const tracks = sortedThemes.map((theme) => {
        const ms = researchEvents.filter((event) => event.themeIds.includes(theme.id)).sort((a, b) => a.year - b.year);
        const years = ms.map((event) => event.year);
        // Include later appearances even when the research itself has concluded.
        const startYear = Math.min(theme.yearStart, ...years);
        const endYear = theme.ongoing ? MAX_YEAR : Math.max(theme.yearEnd ?? theme.yearStart, ...years);
        const places = Array.from(
            new Set([...ms].reverse().flatMap((event) => (event.city ? [event.country ? `${event.city}, ${event.country}` : event.city] : [])))
        );
        return {
            theme,
            ms,
            marks: fanMarks(ms, SPAN, pos),
            startYear,
            endYear,
            places,
            live: ms.some((event) => event.status === 'current'),
        };
    });
    const distinctCities = new Set(researchEvents.filter((event) => event.city).map((event) => `${event.city}, ${event.country ?? ''}`));

    // The score reads left→right in time; the reading panels below it lead with the newest thread.
    const threadsNewestFirst = [...tracks].reverse();

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        }
    }, []);

    const goToThread = (id: string) => {
        document.getElementById(`thread-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(40px,8vh,104px)] max-sm:pt-6 pb-[clamp(36px,5vw,64px)]">
                <p className="thread-rise font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-accent)]">
                    Long-term research
                </p>
                <h1 className="thread-rise mt-[clamp(16px,2vw,28px)] whitespace-nowrap max-sm:whitespace-normal max-sm:text-balance font-[family-name:var(--font-display)] text-[min(3.25vw,47px)] max-sm:text-[clamp(32px,8vw,44px)] font-normal leading-[0.96] max-sm:leading-[1.1] tracking-[-0.01em] [animation-delay:80ms]">
                    An ongoing inquiry into sound, carried across time and place.
                </h1>
                <div className="thread-rise mt-[clamp(24px,3vw,44px)] grid gap-[clamp(24px,4vw,72px)] md:grid-cols-[1fr_auto] md:items-end [animation-delay:160ms]">
                    <p className="max-w-[62ch] text-[length:calc(clamp(15px,1.3vw,18px)*var(--copy-scale))] font-light leading-[1.7] text-[var(--color-text-secondary)]">
                        Tarek Atoui works in long-term threads rather than single exhibitions. Each begins in fieldwork and collaboration, takes form
                        as instruments and listening spaces, and keeps changing as it travels. Follow them below across the years and the places they
                        have sounded — the full chronology lives on the{' '}
                        <a
                            className="text-[var(--color-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
                            href="/news"
                        >
                            timeline
                        </a>
                        .
                    </p>
                    <ul className="flex flex-wrap gap-x-[clamp(22px,3vw,48px)] gap-y-5 md:justify-end">
                        <Figure value={`${MIN_YEAR}→`} label="spanning" />
                        <Figure value={String(themes.length)} label="threads" />
                        <Figure value={String(researchEvents.length)} label="presentations" />
                        <Figure value={String(distinctCities.size)} label="places" />
                    </ul>
                </div>
            </section>

            {/* ── The score ──────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
                <div className="thread-rise flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                        The threads
                    </h2>
                    <p className="hidden gap-5 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:flex">
                        <span className="flex items-center gap-2">
                            <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-accent)]" />
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
                        {TICKS.map((y) => (
                            <span
                                key={y}
                                className="absolute -translate-x-1/2 font-mono text-[length:calc(10px*var(--copy-scale))] text-[var(--color-text-secondary)]"
                                style={{ left: `${pos(y)}%` }}
                            >
                                {y}
                            </span>
                        ))}
                        <span className="absolute right-0 hidden font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.15em] text-[var(--color-accent)] sm:block">
                            ongoing →
                        </span>
                    </div>
                </div>

                {/* tracks */}
                <div className="mt-4 sm:mt-1">
                    {tracks.map((t, i) => {
                        const active = hovered === t.theme.id;
                        const left = pos(t.startYear);
                        const width = pos(t.endYear) - left;
                        return (
                            <button
                                key={t.theme.id}
                                type="button"
                                onClick={() => goToThread(t.theme.id)}
                                onMouseEnter={() => setHovered(t.theme.id)}
                                onMouseLeave={() => setHovered('')}
                                onFocus={() => setHovered(t.theme.id)}
                                onBlur={() => setHovered('')}
                                className={`relative block w-full cursor-pointer border-b border-[var(--color-border)] py-2 max-sm:py-3.5 text-left transition-colors ${SCORE_GRID} sm:items-center hover:bg-[var(--color-hover-bg)] ${active ? 'z-20' : ''}`}
                            >
                                {/* label */}
                                <div className="thread-rise flex flex-col items-start gap-1 sm:block" style={{ animationDelay: `${i * 55}ms` }}>
                                    <span
                                        className={`font-[family-name:var(--font-display)] text-[clamp(17px,1.5vw,23px)] max-sm:text-[clamp(22px,6vw,26px)] leading-tight transition-colors ${active ? 'text-[var(--color-accent)]' : ''}`}
                                    >
                                        {t.theme.title}
                                    </span>
                                    <span className="flex items-center gap-2 font-mono text-[length:calc(10px*var(--copy-scale))] max-sm:text-[length:calc(11px*var(--copy-scale))] tracking-[0.1em] max-sm:tracking-[0.03em] text-[var(--color-text-secondary)] sm:mt-1 sm:block">
                                        {t.theme.ongoing && (
                                            <span
                                                aria-hidden="true"
                                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)] sm:hidden"
                                            />
                                        )}
                                        {t.theme.yearsDisplay}
                                    </span>
                                </div>

                                {/* track */}
                                <div className="relative mt-2 h-[clamp(28px,4.5vh,44px)] max-sm:hidden sm:mt-0">
                                    {/* gridlines (static, shared across rows) */}
                                    {TICKS.map((y) => (
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
                                        {t.theme.ongoing && (
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
                                            const lit = mark?.themeId === t.theme.id && mark.m.id === m.id;
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
                                        {t.theme.ongoing ? (
                                            <span
                                                className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] ${t.live ? 'thread-pulse' : ''}`}
                                                style={{ left: `${pos(t.endYear)}%` }}
                                            />
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
                                            onMouseEnter={() => setMark({ themeId: t.theme.id, m })}
                                            onMouseLeave={() => setMark(null)}
                                            className="absolute top-0 bottom-0 z-20 w-[12px] -translate-x-1/2"
                                            style={{ left: t.marks.get(m.id) ?? `${pos(m.year)}%` }}
                                        />
                                    ))}
                                    {mark?.themeId === t.theme.id && <MarkCard m={mark.m} left={pos(mark.m.year)} />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── The threads, in full ───────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
                {threadsNewestFirst.map((t) => {
                    const { theme } = t;
                    return (
                        <article
                            key={theme.id}
                            id={`thread-${theme.id}`}
                            className="scroll-mt-[calc(var(--header-height,64px)+16px)] border-t border-[var(--color-border)] py-[clamp(40px,7vw,104px)] max-sm:last:pb-6 first:border-t-0 first:pt-[clamp(28px,4vw,48px)]"
                        >
                            <div className="flex items-center gap-3 font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.22em]">
                                {theme.ongoing ? (
                                    <span className="flex items-center gap-2 text-[var(--color-accent)]">
                                        <span className={`h-[7px] w-[7px] rounded-full bg-[var(--color-accent)] ${t.live ? 'thread-pulse' : ''}`} />
                                        ongoing
                                    </span>
                                ) : (
                                    <span className="text-[var(--color-text-secondary)]">concluded</span>
                                )}
                                <span className="text-[var(--color-text-secondary)]">{theme.yearsDisplay}</span>
                            </div>

                            <h3 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(36px,5.6vw,80px)] font-normal leading-[0.98] tracking-[-0.01em]">
                                <a href={`/research/${theme.id}`} className="transition-colors hover:text-[var(--color-accent)]">
                                    {theme.title}
                                </a>
                            </h3>
                            {theme.subtitle && (
                                <p className="mt-2 font-[family-name:var(--font-display)] text-[clamp(17px,2vw,26px)] italic text-[var(--color-text-secondary)]">
                                    {theme.subtitle}
                                </p>
                            )}
                            <p className="mt-6 max-w-[58ch] text-[length:calc(clamp(16px,1.5vw,22px)*var(--copy-scale))] font-light leading-[1.55]">
                                {theme.summary}
                            </p>

                            <div className="mt-[clamp(28px,4vw,56px)] grid items-start gap-[clamp(28px,4vw,56px)] lg:grid-cols-[1.45fr_1fr]">
                                <div>
                                    {theme.heroImage && (
                                        <a href={`/research/${theme.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]">
                                            <img
                                                src={mediaUrl(theme.heroImage)}
                                                alt={theme.title}
                                                loading="lazy"
                                                className="w-full object-cover aspect-[3/2]"
                                            />
                                        </a>
                                    )}
                                </div>

                                <aside>
                                    <dl>
                                        <Row label="Span" value={theme.yearsDisplay} />
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
                                        {theme.materials && theme.materials.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                                    Material
                                                </dt>
                                                <dd className="flex flex-wrap gap-1.5">
                                                    {theme.materials.map((mat) => (
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
                                        {theme.collaborators && theme.collaborators.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                                    With
                                                </dt>
                                                <dd className="text-[length:calc(13px*var(--copy-scale))] font-light leading-relaxed">
                                                    {theme.collaborators.join(', ')}
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
                                                        {m.venue}
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
                                        href={`/research/${theme.id}`}
                                        className="mt-7 inline-block font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-accent)] hover:underline underline-offset-4"
                                    >
                                        Explore the thread →
                                    </a>
                                </aside>
                            </div>
                        </article>
                    );
                })}
            </section>
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
