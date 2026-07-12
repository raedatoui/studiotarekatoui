'use client';

import { useEffect, useState } from 'react';
import { manifestations, manifestationsForTheme, themePlaces, themes } from '@/data/projects';

/**
 * Projects hub — the long-term research threads as a living score.
 *
 * Each thread is a lifeline plotted on a shared time axis (TIME); ongoing threads
 * dissolve off the right edge into a patina tail (the ongoing inquiry), concluded
 * ones cap off. Below, each thread opens into a reading panel carrying the places it
 * has travelled (SPACE), its materials, collaborators and chronology.
 */

// Shared time scale. Years map into 0–92% so the right 8% reads as the "ongoing / now" zone.
const TICKS = [2011, 2014, 2017, 2020, 2023, 2026];
const sortedThemes = [...themes].sort((a, b) => a.yearStart - b.yearStart);
const allYears = manifestations.map((m) => m.year);
const MIN_YEAR = Math.min(...sortedThemes.map((t) => t.yearStart), ...allYears);
const MAX_YEAR = Math.max(...allYears);
const SPAN = MAX_YEAR - MIN_YEAR;
const pos = (year: number): number => ((year - MIN_YEAR) / SPAN) * 92;

const tracks = sortedThemes.map((theme) => {
    const ms = manifestationsForTheme(theme.id);
    const years = ms.map((m) => m.year);
    const startYear = Math.min(theme.yearStart, ...(years.length ? years : [theme.yearStart]));
    const lastYear = years.length ? Math.max(...years) : theme.yearStart;
    // A lifeline always spans far enough to cover its own marks, even when the
    // declared yearEnd predates a later (re)appearance in a group show.
    const endYear = theme.ongoing ? MAX_YEAR : Math.max(theme.yearEnd ?? theme.yearStart, lastYear);
    return {
        theme,
        ms: [...ms].sort((a, b) => a.year - b.year),
        startYear,
        endYear,
        places: themePlaces(theme.id),
        count: ms.length,
    };
});

const distinctCities = new Set(manifestations.filter((m) => m.city).map((m) => `${m.city}, ${m.country ?? ''}`));
const SHOW_COUNT = manifestations.length;
const PLACE_COUNT = distinctCities.size;

const SCORE_GRID = 'grid gap-x-[clamp(14px,2.4vw,32px)] sm:grid-cols-[150px_1fr] md:grid-cols-[210px_1fr]';

function Figure({ value, label }: { value: string; label: string }) {
    return (
        <li className="shrink-0">
            <span className="block font-mono text-[clamp(18px,2.1vw,28px)] leading-none">{value}</span>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{label}</span>
        </li>
    );
}

export default function ProjectsHub() {
    const [hovered, setHovered] = useState('');

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
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(40px,8vh,104px)] pb-[clamp(36px,5vw,64px)]">
                <p className="thread-rise font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)]">Long-term research</p>
                <h1 className="thread-rise mt-[clamp(16px,2vw,28px)] max-w-[15ch] font-[family-name:var(--font-display)] text-[clamp(40px,7.2vw,108px)] font-normal leading-[0.96] tracking-[-0.01em] [animation-delay:80ms]">
                    An ongoing inquiry into sound, carried across time and place.
                </h1>
                <div className="thread-rise mt-[clamp(24px,3vw,44px)] grid gap-[clamp(24px,4vw,72px)] md:grid-cols-[1fr_auto] md:items-end [animation-delay:160ms]">
                    <p className="max-w-[62ch] text-[clamp(15px,1.3vw,18px)] font-light leading-[1.7] text-[var(--color-text-secondary)]">
                        Tarek Atoui works in long-term threads rather than single exhibitions. Each begins in fieldwork and collaboration, takes form as
                        instruments and listening spaces, and keeps changing as it travels. Follow them below across the years and the places they have
                        sounded — the full chronology lives on the{' '}
                        <a className="text-[var(--color-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]" href="/exhibitions">
                            timeline
                        </a>
                        .
                    </p>
                    <ul className="flex flex-wrap gap-x-[clamp(22px,3vw,48px)] gap-y-5 md:justify-end">
                        <Figure value={`${MIN_YEAR}→`} label="spanning" />
                        <Figure value={String(themes.length)} label="threads" />
                        <Figure value={String(SHOW_COUNT)} label="presentations" />
                        <Figure value={String(PLACE_COUNT)} label="places" />
                    </ul>
                </div>
            </section>

            {/* ── The score ──────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(48px,7vw,96px)]">
                <div className="thread-rise flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">The threads</h2>
                    <p className="hidden gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:flex">
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
                <div className={`thread-rise mt-7 ${SCORE_GRID}`}>
                    <div className="hidden sm:block" />
                    <div className="relative h-4">
                        {TICKS.map((y) => (
                            <span key={y} className="absolute -translate-x-1/2 font-mono text-[10px] text-[var(--color-text-secondary)]" style={{ left: `${pos(y)}%` }}>
                                {y}
                            </span>
                        ))}
                        <span className="absolute right-0 hidden font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-accent)] sm:block">
                            ongoing →
                        </span>
                    </div>
                </div>

                {/* tracks */}
                <div className="mt-1">
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
                                className={`block w-full cursor-pointer border-b border-[var(--color-border)] py-2 text-left transition-colors ${SCORE_GRID} sm:items-center hover:bg-[var(--color-hover-bg)]`}
                            >
                                {/* label */}
                                <div
                                    className="thread-rise flex items-baseline justify-between gap-3 sm:block"
                                    style={{ animationDelay: `${i * 55}ms` }}
                                >
                                    <span
                                        className={`font-[family-name:var(--font-display)] text-[clamp(17px,1.5vw,23px)] leading-tight transition-colors ${active ? 'text-[var(--color-accent)]' : ''}`}
                                    >
                                        {t.theme.title}
                                    </span>
                                    <span className="shrink-0 font-mono text-[10px] tracking-[0.1em] text-[var(--color-text-secondary)] sm:mt-1 sm:block">
                                        {t.theme.yearsDisplay}
                                    </span>
                                </div>

                                {/* track */}
                                <div className="relative mt-2 h-[clamp(28px,4.5vh,44px)] sm:mt-0">
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

                                        {/* manifestation marks */}
                                        {t.ms.map((m) => (
                                            <span
                                                key={m.id}
                                                title={`${m.year} · ${m.venue}${m.city ? `, ${m.city}` : ''}`}
                                                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${active ? 'h-[6px] w-[6px] bg-[var(--color-accent)]' : 'h-[4px] w-[4px] bg-[var(--color-text)] opacity-55'}`}
                                                style={{ left: `${pos(m.year)}%` }}
                                            />
                                        ))}

                                        {/* end state */}
                                        {t.theme.ongoing ? (
                                            <span
                                                className="thread-pulse absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]"
                                                style={{ left: `${pos(t.endYear)}%` }}
                                            />
                                        ) : (
                                            <span
                                                className="absolute top-1/2 h-[12px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-text-secondary)]"
                                                style={{ left: `${pos(t.endYear)}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* ── The threads, in full ───────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
                {tracks.map((t) => {
                    const { theme } = t;
                    return (
                        <article
                            key={theme.id}
                            id={`thread-${theme.id}`}
                            className="scroll-mt-[calc(var(--header-height,64px)+16px)] border-t border-[var(--color-border)] py-[clamp(40px,7vw,104px)]"
                        >
                            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                                {theme.ongoing ? (
                                    <span className="flex items-center gap-2 text-[var(--color-accent)]">
                                        <span className="thread-pulse h-[7px] w-[7px] rounded-full bg-[var(--color-accent)]" />
                                        ongoing
                                    </span>
                                ) : (
                                    <span className="text-[var(--color-text-secondary)]">concluded</span>
                                )}
                                <span className="text-[var(--color-text-secondary)]">{theme.yearsDisplay}</span>
                            </div>

                            <h3 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(36px,5.6vw,80px)] font-normal leading-[0.98] tracking-[-0.01em]">
                                {theme.title}
                            </h3>
                            {theme.subtitle && (
                                <p className="mt-2 font-[family-name:var(--font-display)] text-[clamp(17px,2vw,26px)] italic text-[var(--color-text-secondary)]">
                                    {theme.subtitle}
                                </p>
                            )}
                            <p className="mt-6 max-w-[58ch] text-[clamp(16px,1.5vw,22px)] font-light leading-[1.55]">{theme.summary}</p>

                            <div className="mt-[clamp(28px,4vw,56px)] grid items-start gap-[clamp(28px,4vw,56px)] lg:grid-cols-[1.45fr_1fr]">
                                <div>
                                    {theme.heroImage && (
                                        <img
                                            src={theme.heroImage}
                                            alt={theme.title}
                                            loading="lazy"
                                            className="w-full object-cover aspect-[3/2]"
                                        />
                                    )}
                                    <div className="mt-8 max-w-[64ch] space-y-5">
                                        {theme.description.map((paragraph) => (
                                            <p key={paragraph} className="text-[clamp(14px,1.05vw,16px)] font-light leading-[1.8]">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <aside>
                                    <dl>
                                        <Row label="Span" value={theme.yearsDisplay} />
                                        <Row label="Shown" value={`${t.count} ${t.count === 1 ? 'presentation' : 'presentations'}`} />
                                        {t.places.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Places</dt>
                                                <dd className="font-mono text-[12px] leading-relaxed">{t.places.map((p) => p.split(',')[0]).join(' · ')}</dd>
                                            </div>
                                        )}
                                        {theme.materials && theme.materials.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Material</dt>
                                                <dd className="flex flex-wrap gap-1.5">
                                                    {theme.materials.map((mat) => (
                                                        <span
                                                            key={mat}
                                                            className="border border-[var(--color-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)]"
                                                        >
                                                            {mat}
                                                        </span>
                                                    ))}
                                                </dd>
                                            </div>
                                        )}
                                        {theme.collaborators && theme.collaborators.length > 0 && (
                                            <div className="grid grid-cols-[78px_1fr] items-baseline gap-4 border-t border-[var(--color-border)] py-4">
                                                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">With</dt>
                                                <dd className="text-[13px] font-light leading-relaxed">{theme.collaborators.join(', ')}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    {/* where & when — the thread's own path across time and space */}
                                    <div className="mt-1 border-t border-[var(--color-border)] pt-5">
                                        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Where &amp; when</p>
                                        <ol className="space-y-3">
                                            {t.ms.map((m) => (
                                                <li key={m.id} className="grid grid-cols-[40px_1fr] items-baseline gap-3">
                                                    <span className="font-mono text-[12px] text-[var(--color-accent)]">{m.year}</span>
                                                    <span className="text-[13px] leading-snug">
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

                                    {theme.portfolioId && (
                                        <a
                                            href={`/portfolio#${theme.portfolioId}`}
                                            className="mt-7 inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)] hover:underline underline-offset-4"
                                        >
                                            View works →
                                        </a>
                                    )}
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
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{label}</dt>
            <dd className="text-[14px] font-light">{value}</dd>
        </div>
    );
}
