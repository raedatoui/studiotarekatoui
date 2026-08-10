'use client';

import { useEffect, useState } from 'react';
import ImageSlider from '@/components/ImageSlider';
import { getTheme, projectsForTheme, themePlaces } from '@/data/projects';
import type { Media, Project } from '@/data/projects-schema';
import { useSiteData } from '@/data/SiteDataProvider';

/**
 * Research thread — the dedicated page for one long-term research theme.
 *
 * A single lifeline plotted on the theme's own time span, the full thematic text,
 * and the chronology of its projects. Every project — mark on the line or
 * row in the chronology — opens its media as placeholder boxes linking out to the
 * documentation. The gallery is the same slider the portfolio uses.
 */

/** A media item as a placeholder box: type badge up top, caption below, links out. */
function MediaBox({ item }: { item: Media }) {
    return (
        <a href={item.url} target="_blank" rel="noreferrer" className="group block border border-[var(--color-border)]">
            <span className="flex aspect-[4/3] items-center justify-center bg-[var(--color-hover-bg)]">
                <span className="border border-[var(--color-border)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] transition-colors group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]">
                    {item.type} ↗
                </span>
            </span>
            {item.label && (
                <span className="block border-t border-[var(--color-border)] px-3 py-2.5 text-[12px] font-light leading-snug">{item.label}</span>
            )}
        </a>
    );
}

const THIS_YEAR = new Date().getFullYear();
/** Smallest distance between two marks sharing a year — dots are 9px, 14px when lit. */
const MARK_GAP_PX = 15;

/** One fact in the horizontal meta row under the description. */
function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="max-w-[44ch]">
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{label}</dt>
            <dd className="mt-2.5 text-[clamp(16px,1.4vw,20px)] font-light leading-snug">{value}</dd>
        </div>
    );
}

export default function ResearchThread({ themeId }: { themeId: string }) {
    const theme = getTheme(themeId);
    const { portfolio } = useSiteData();
    const [openId, setOpenId] = useState('');
    const [hoveredId, setHoveredId] = useState('');

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        }
    }, []);

    if (!theme) {
        return null;
    }

    const ms = [...projectsForTheme(themeId)].sort((a, b) => a.year - b.year);
    // "Live" = something is happening right now; only then do the ongoing dots pulse.
    const live = ms.some((m) => m.status === 'current');
    const places = themePlaces(themeId);
    const work = theme.portfolioId ? portfolio.find((w) => w.id === theme.portfolioId) : undefined;

    // Time scale over the theme's own span. Each year owns a [y, y+1) slot so marks
    // sharing a year can spread inside it; when ongoing, the right 8% is the "now" zone.
    const years = ms.map((m) => m.year);
    const startYear = Math.min(theme.yearStart, ...(years.length ? years : [theme.yearStart]));
    const lastYear = years.length ? Math.max(...years) : theme.yearStart;
    const endYear = theme.ongoing ? lastYear : Math.max(theme.yearEnd ?? theme.yearStart, lastYear);
    const span = endYear + 1 - startYear;
    const axisMax = theme.ongoing ? 92 : 100;
    const pos = (t: number): number => ((t - startYear) / span) * axisMax;

    const byYear = new Map<number, Project[]>();
    for (const m of ms) {
        byYear.set(m.year, [...(byYear.get(m.year) ?? []), m]);
    }
    // Marks sharing a year fan out around the middle of that year's slot. The gap is the
    // slot's own share, floored in px by CSS max() so a crowded year stays countable on a
    // narrow track without having to measure it. markPos keeps the unfloored percentage,
    // which is only ever used to decide which way the hover card opens.
    const markPos = new Map<string, number>();
    const markLeft = new Map<string, string>();
    for (const [year, group] of byYear) {
        const gap = (axisMax / span) / (group.length + 1);
        const center = pos(year + 0.5);
        group.forEach((m, i) => {
            const k = i - (group.length - 1) / 2;
            const offset = `${Math.abs(k)} * max(${gap.toFixed(3)}%, ${MARK_GAP_PX}px)`;
            markPos.set(m.id, center + k * gap);
            markLeft.set(m.id, k === 0 ? `${center}%` : `calc(${center}% ${k < 0 ? '-' : '+'} ${offset})`);
        });
    }

    const tickStep = Math.max(1, Math.ceil(span / 8));
    const ticks: number[] = [];
    for (let y = startYear; y <= endYear; y += tickStep) {
        ticks.push(y);
    }
    // The stepped loop can stop short, so the line would end on an unlabelled year.
    // Always close on endYear, dropping the tick before it when it would crowd.
    if (ticks[ticks.length - 1] !== endYear) {
        if (ticks.length > 1 && endYear - ticks[ticks.length - 1] < tickStep / 2) {
            ticks.pop();
        }
        ticks.push(endYear);
    }

    const openProject = (id: string) => {
        setOpenId(id);
        document.getElementById(`project-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const hovered = hoveredId ? ms.find((m) => m.id === hoveredId) : undefined;

    return (
        <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(32px,6vh,72px)] pb-[clamp(32px,5vw,56px)]">
                <a
                    className="thread-rise font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
                    href="/research"
                >
                    ← Long-term research
                </a>
                <div className="thread-rise mt-[clamp(20px,3vw,36px)] flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] [animation-delay:60ms]">
                    {theme.ongoing ? (
                        <span className="flex items-center gap-2 text-[var(--color-accent)]">
                            <span className={`h-[7px] w-[7px] rounded-full bg-[var(--color-accent)] ${live ? 'thread-pulse' : ''}`} />
                            ongoing
                        </span>
                    ) : (
                        <span className="text-[var(--color-text-secondary)]">concluded</span>
                    )}
                    <span className="text-[var(--color-text-secondary)]">{theme.yearsDisplay}</span>
                </div>
                <h1 className="thread-rise mt-4 font-[family-name:var(--font-display)] text-[clamp(40px,6.5vw,92px)] font-normal leading-[0.98] tracking-[-0.01em] [animation-delay:120ms]">
                    {theme.title}
                </h1>
                {theme.subtitle && (
                    <p className="thread-rise mt-2 font-[family-name:var(--font-display)] text-[clamp(18px,2.2vw,28px)] italic text-[var(--color-text-secondary)] [animation-delay:180ms]">
                        {theme.subtitle}
                    </p>
                )}
            </section>

            {/* ── The thread, in full ────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(40px,6vw,80px)]">
                <div className="border-t border-[var(--color-border)] pt-[clamp(28px,4vw,48px)]">
                    {/* lede — first paragraph carries the width on its own */}
                    <p className="text-[clamp(17px,1.9vw,27px)] font-light leading-[1.55]">{theme.description[0]}</p>
                    {theme.description.length > 1 && (
                        <div className="mt-[clamp(24px,3vw,40px)] space-y-5">
                            {theme.description.slice(1).map((paragraph) => (
                                <p key={paragraph} className="text-[clamp(14px,1.05vw,16px)] font-light leading-[1.8]">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <dl className="mt-[clamp(28px,4vw,48px)] flex flex-wrap gap-x-[clamp(40px,6vw,96px)] gap-y-7 border-t border-[var(--color-border)] pt-[clamp(20px,2.5vw,32px)]">
                    <MetaItem label="Span" value={theme.yearsDisplay} />
                    {places.length > 0 && <MetaItem label="Places" value={places.map((p) => p.split(',')[0]).join(' · ')} />}
                    {theme.materials && theme.materials.length > 0 && <MetaItem label="Material" value={theme.materials.join(' · ')} />}
                    {theme.collaborators && theme.collaborators.length > 0 && <MetaItem label="With" value={theme.collaborators.join(', ')} />}
                </dl>
            </section>

            {/* ── The timeline ───────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(40px,6vw,80px)]">
                <div className="thread-rise flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Timeline</h2>
                    <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:block">
                        click a mark to open its media
                    </p>
                </div>

                <div className="thread-rise relative mt-10 [animation-delay:100ms]">
                    {/* year ticks */}
                    <div className="relative h-4">
                        {ticks.map((y) => (
                            <span
                                key={y}
                                className="absolute -translate-x-1/2 font-mono text-[10px] text-[var(--color-text-secondary)]"
                                style={{ left: `${pos(y)}%` }}
                            >
                                {y}
                            </span>
                        ))}
                        {theme.ongoing && (
                            <span className="absolute right-0 hidden font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-accent)] sm:block">
                                ongoing →
                            </span>
                        )}
                    </div>

                    {/* track */}
                    <div className="relative mt-2 h-[clamp(56px,9vh,88px)]">
                        {ticks.map((y) => (
                            <span
                                key={y}
                                aria-hidden
                                className="absolute top-0 bottom-0 w-px bg-[var(--color-border)] opacity-40"
                                style={{ left: `${pos(y)}%` }}
                            />
                        ))}

                        <div className="thread-draw absolute inset-0" style={{ animationDelay: '220ms' }}>
                            {/* base line */}
                            <span
                                className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--color-text)] opacity-30"
                                style={{ left: 0, width: `${axisMax}%` }}
                            />

                            {/* ongoing tail → dissolves off the edge */}
                            {theme.ongoing ? (
                                <>
                                    <span
                                        className="absolute top-1/2 h-px -translate-y-1/2"
                                        style={{
                                            left: `${axisMax}%`,
                                            right: 0,
                                            background: 'linear-gradient(90deg, var(--color-accent), transparent)',
                                        }}
                                    />
                                    <span
                                        className={`absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] ${live ? 'thread-pulse' : ''}`}
                                        style={{ left: `${axisMax}%` }}
                                    />
                                </>
                            ) : (
                                <span
                                    className="absolute top-1/2 h-[12px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-text-secondary)]"
                                    style={{ left: '100%' }}
                                />
                            )}
                        </div>

                        {/* project marks */}
                        {ms.map((m) => {
                            const left = markLeft.get(m.id) ?? `${pos(m.year)}%`;
                            const lit = openId === m.id || hoveredId === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    aria-label={`${m.venue}, ${m.year}`}
                                    onClick={() => openProject(m.id)}
                                    onMouseEnter={() => setHoveredId(m.id)}
                                    onMouseLeave={() => setHoveredId('')}
                                    onFocus={() => setHoveredId(m.id)}
                                    onBlur={() => setHoveredId('')}
                                    className="absolute top-0 bottom-0 z-20 w-[15px] -translate-x-1/2 cursor-pointer"
                                    style={{ left }}
                                >
                                    <span
                                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${
                                            lit
                                                ? 'h-[14px] w-[14px] bg-[var(--color-accent)]'
                                                : m.year === THIS_YEAR
                                                  ? 'h-[9px] w-[9px] bg-[var(--color-recent)]'
                                                  : 'h-[9px] w-[9px] bg-[var(--color-text)] opacity-55'
                                        }`}
                                    />
                                </button>
                            );
                        })}

                        {/* hover card */}
                        {hovered && (
                            <div
                                aria-hidden
                                className="pointer-events-none absolute bottom-[calc(100%+10px)] z-30 w-[min(268px,62vw)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                                style={{
                                    left: markLeft.get(hovered.id) ?? `${pos(hovered.year)}%`,
                                    transform:
                                        (markPos.get(hovered.id) ?? 0) < 15
                                            ? 'translateX(0)'
                                            : (markPos.get(hovered.id) ?? 0) > 78
                                              ? 'translateX(-100%)'
                                              : 'translateX(-50%)',
                                }}
                            >
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                                    {hovered.kind} · {hovered.year}
                                </p>
                                {hovered.title && (
                                    <p className="mt-2 font-[family-name:var(--font-display)] text-[17px] leading-tight">{hovered.title}</p>
                                )}
                                <p className="mt-1.5 text-[12.5px] font-light leading-snug">{hovered.venue}</p>
                                {(hovered.city || hovered.country) && (
                                    <p className="text-[12.5px] font-light leading-snug text-[var(--color-text-secondary)]">
                                        {[hovered.city, hovered.country].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Gallery — same slider as the portfolio ─────────────── */}
            {work && work.images.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(56px,8vw,112px)]">
                    <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5 mb-[clamp(24px,3vw,40px)]">
                        <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Gallery</h2>
                        <a
                            href={`/portfolio#${work.id}`}
                            className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent)] hover:underline underline-offset-4"
                        >
                            In the portfolio →
                        </a>
                    </div>
                    <ImageSlider images={work.images} title={work.title} />
                </section>
            )}

            {/* ── Where & when ───────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(48px,7vw,96px)]">
                <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Where &amp; when</h2>
                    <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:block">
                        {ms.length} {ms.length === 1 ? 'presentation' : 'presentations'}
                    </p>
                </div>

                <ol className="mt-2">
                    {ms.map((m) => {
                        const open = openId === m.id;
                        const place = [m.city, m.country].filter(Boolean).join(', ');
                        return (
                            <li
                                key={m.id}
                                id={`project-${m.id}`}
                                className="scroll-mt-[calc(var(--header-height,64px)+16px)] border-b border-[var(--color-border)]"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenId(open ? '' : m.id)}
                                    className={`grid w-full cursor-pointer grid-cols-[48px_1fr_auto] items-baseline gap-4 py-4 text-left transition-colors hover:bg-[var(--color-hover-bg)] ${
                                        open ? 'bg-[var(--color-hover-bg)]' : ''
                                    }`}
                                >
                                    <span className="font-mono text-[12px] text-[var(--color-accent)]">{m.year}</span>
                                    <span>
                                        <span className={`text-[15px] leading-snug transition-colors ${open ? 'text-[var(--color-accent)]' : ''}`}>
                                            {m.title ?? m.venue}
                                        </span>
                                        <span className="mt-1 block text-[12.5px] font-light text-[var(--color-text-secondary)]">
                                            {m.kind}
                                            {m.title && ` · ${m.venue}`}
                                            {place && ` — ${place}`}
                                        </span>
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
                                        {m.media?.length ? `${m.media.length} media` : ''} {open ? '−' : '+'}
                                    </span>
                                </button>

                                {open && (
                                    <div className="px-[48px] pt-1 pb-7 max-sm:px-0">
                                        {m.dateDisplay && <p className="font-mono text-[11px] text-[var(--color-text-secondary)]">{m.dateDisplay}</p>}
                                        {m.note && <p className="mt-2 max-w-[64ch] text-[13px] font-light leading-relaxed">{m.note}</p>}
                                        {m.media && m.media.length > 0 ? (
                                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                {m.media.map((item) => (
                                                    <MediaBox key={item.url} item={item} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mt-4 flex aspect-[4/1] max-w-[480px] items-center justify-center border border-dashed border-[var(--color-border)]">
                                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                                    documentation coming soon
                                                </span>
                                            </div>
                                        )}
                                        {m.url && (
                                            <a
                                                href={m.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)] hover:underline underline-offset-4"
                                            >
                                                Visit ↗
                                            </a>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </section>
        </main>
    );
}
