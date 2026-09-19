'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { getTheme, projects } from '@/data/projects';
import type { Media, Project } from '@/data/projects-schema';
import { isDropboxUrl, publicMedia } from '@/lib/media';

/**
 * Chronology — every project, newest first, as one vertical run of cards.
 *
 * No year headings: the list stays continuous and a hairline carrying the year
 * marks each change of year as you scroll. Two dropdowns narrow the run by kind
 * and by year. A card carries its theme links only when it belongs to one of the
 * long-term threads; standalone work simply omits the row.
 */

const KINDS = Array.from(new Set(projects.map((p) => p.kind))).sort();
const YEARS = Array.from(new Set(projects.map((p) => p.year))).sort((a, b) => b - a);
const BY_DATE = [...projects].sort((a, b) => b.year - a.year || (b.dateStart ?? '').localeCompare(a.dateStart ?? ''));
const THIS_YEAR = new Date().getFullYear();

/** A media item as a placeholder box: type badge up top, caption below, links out. */
function MediaBox({ item }: { item: Media }) {
    return (
        <a href={item.url} target="_blank" rel="noreferrer" className="group block border border-[var(--color-border)]">
            <span className="flex aspect-[4/3] items-center justify-center bg-[var(--color-hover-bg)]">
                <span className="border border-[var(--color-border)] px-2.5 py-1.5 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] transition-colors group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]">
                    {item.type} ↗
                </span>
            </span>
            {item.label && (
                <span className="block border-t border-[var(--color-border)] px-3 py-2.5 text-[length:calc(12px*var(--copy-scale))] font-light leading-snug">{item.label}</span>
            )}
        </a>
    );
}

const SELECT =
    'cursor-pointer appearance-none border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-3 pr-9 font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.15em] text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none';

/** Native select wrapped for the chevron and its micro-label. */
function Filter({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
    return (
        <label className="flex items-center gap-3">
            <span className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{label}</span>
            <span className="relative inline-block">
                <select className={SELECT} value={value} onChange={(e) => onChange(e.target.value)}>
                    {children}
                </select>
                <span
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[length:calc(10px*var(--copy-scale))] text-[var(--color-text-secondary)]"
                >
                    ▾
                </span>
            </span>
        </label>
    );
}

function ProjectCard({ project, open, onToggle }: { project: Project; open: boolean; onToggle: () => void }) {
    const place = [project.city, project.country].filter(Boolean).join(', ');
    const media = publicMedia(project.media ?? []);
    // Only the threads this project actually belongs to; standalone work shows none.
    const linkedThemes = (project.themeIds ?? []).map(getTheme).filter((t) => t !== undefined);

    return (
        <article
            id={`project-${project.id}`}
            className={`scroll-mt-[calc(var(--header-height,64px)+16px)] border transition-colors ${
                open ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-text-secondary)]'
            }`}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-start gap-4 px-[clamp(16px,2vw,28px)] py-[clamp(16px,2vw,24px)] text-left transition-colors hover:bg-[var(--color-hover-bg)]"
            >
                <span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em]">
                        <span className={project.year === THIS_YEAR ? 'text-[var(--color-recent)]' : 'text-[var(--color-accent)]'}>{project.kind}</span>
                        {project.status && project.status !== 'past' && (
                            <span className="border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-text-secondary)]">{project.status}</span>
                        )}
                    </span>

                    <span className="mt-3 block font-[family-name:var(--font-display)] text-[clamp(20px,2.2vw,30px)] leading-[1.1]">
                        {project.title ?? project.venue}
                    </span>

                    <span className="mt-2 block text-[length:calc(13.5px*var(--copy-scale))] font-light leading-snug">
                        {project.title && <span>{project.venue}</span>}
                        {project.title && place && <span className="text-[var(--color-text-secondary)]"> — </span>}
                        {place && <span className="text-[var(--color-text-secondary)]">{place}</span>}
                    </span>

                    {project.dateDisplay && (
                        <span className="mt-1.5 block font-mono text-[length:calc(11px*var(--copy-scale))] text-[var(--color-text-secondary)]">{project.dateDisplay}</span>
                    )}
                </span>

                <span className="flex shrink-0 items-center gap-3 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
                    {media.length ? <span className="max-sm:hidden">{media.length} media</span> : null}
                    <span className="text-[length:calc(13px*var(--copy-scale))]">{open ? '−' : '+'}</span>
                </span>
            </button>

            {/* Threads this project belongs to — kept outside the toggle so they stay real links. */}
            {linkedThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-[clamp(16px,2vw,28px)] pb-[clamp(16px,2vw,24px)]">
                    {linkedThemes.map((theme) => (
                        <a
                            key={theme.id}
                            href={`/research/${theme.id}`}
                            className="border border-[var(--color-border)] px-2 py-1 font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                            {theme.title}
                        </a>
                    ))}
                </div>
            )}

            {open && (
                <div className="border-t border-[var(--color-border)] px-[clamp(16px,2vw,28px)] pb-7 pt-5">
                    {project.organization && (
                        <p className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{project.organization}</p>
                    )}
                    {project.note && <p className="mt-2 max-w-[64ch] text-[length:calc(13px*var(--copy-scale))] font-light leading-relaxed">{project.note}</p>}
                    {project.collaborators && project.collaborators.length > 0 && (
                        <p className="mt-2 max-w-[64ch] text-[length:calc(13px*var(--copy-scale))] font-light leading-relaxed text-[var(--color-text-secondary)]">
                            With {project.collaborators.join(', ')}
                        </p>
                    )}

                    {media.length > 0 ? (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {media.map((item) => (
                                <MediaBox key={item.url} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 flex aspect-[4/1] max-w-[480px] items-center justify-center border border-dashed border-[var(--color-border)]">
                            <span className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                                documentation coming soon
                            </span>
                        </div>
                    )}

                    {project.url && !isDropboxUrl(project.url) && (
                        <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-block font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-accent)] underline-offset-4 hover:underline"
                        >
                            Visit ↗
                        </a>
                    )}
                </div>
            )}
        </article>
    );
}

export default function Chronology() {
    const [kind, setKind] = useState('all');
    const [year, setYear] = useState('all');
    const [openId, setOpenId] = useState('');

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        }
    }, []);

    const shown = useMemo(
        () => BY_DATE.filter((p) => (kind === 'all' || p.kind === kind) && (year === 'all' || p.year === Number(year))),
        [kind, year]
    );

    return (
        <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(40px,8vh,104px)] pb-[clamp(28px,4vw,48px)]">
                <p className="thread-rise font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-accent)]">Chronology</p>
                <h1 className="thread-rise mt-[clamp(16px,2vw,28px)] font-[family-name:var(--font-display)] text-[clamp(38px,6vw,84px)] font-normal leading-[0.98] tracking-[-0.01em] [animation-delay:80ms]">
                    Every project, year by year.
                </h1>
                <p className="thread-rise mt-[clamp(20px,2.5vw,36px)] max-w-[62ch] text-[length:calc(clamp(15px,1.3vw,18px)*var(--copy-scale))] font-light leading-[1.7] text-[var(--color-text-secondary)] [animation-delay:160ms]">
                    Exhibitions, performances, commissions, curations and residencies, most recent first. Where a project belongs to one of the
                    long-term{' '}
                    <a
                        className="text-[var(--color-text)] underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-accent)]"
                        href="/research"
                    >
                        research threads
                    </a>
                    , it carries the link.
                </p>
            </section>

            {/* ── Filters ────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
                <div className="thread-rise sticky top-[var(--header-height,64px)] z-30 flex flex-wrap items-center gap-x-[clamp(20px,3vw,40px)] gap-y-4 border-y border-[var(--color-border)] bg-[var(--color-bg)] py-4 [animation-delay:220ms]">
                    <Filter label="Kind" value={kind} onChange={setKind}>
                        <option value="all">All kinds</option>
                        {KINDS.map((k) => (
                            <option key={k} value={k}>
                                {k}
                            </option>
                        ))}
                    </Filter>

                    <Filter label="Year" value={year} onChange={setYear}>
                        <option value="all">All years</option>
                        {YEARS.map((y) => (
                            <option key={y} value={String(y)}>
                                {y}
                            </option>
                        ))}
                    </Filter>

                    <span className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                        {shown.length} / {BY_DATE.length}
                    </span>

                    {(kind !== 'all' || year !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setKind('all');
                                setYear('all');
                            }}
                            className="cursor-pointer font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-accent)] underline-offset-4 hover:underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </section>

            {/* ── The run ────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(56px,8vw,112px)] pt-[clamp(24px,3vw,40px)]">
                {shown.length === 0 ? (
                    <p className="py-[clamp(48px,8vw,96px)] text-center font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                        Nothing in this selection
                    </p>
                ) : (
                    <div className="flex flex-col gap-[clamp(10px,1.2vw,16px)]">
                        {shown.map((project, i) => (
                            <div key={project.id} className="contents">
                                {/* hairline carrying the year, drawn wherever the year changes */}
                                {(i === 0 || shown[i - 1].year !== project.year) && (
                                    <div className={`flex items-center gap-4 ${i === 0 ? '' : 'mt-[clamp(14px,2vw,28px)]'}`}>
                                        <span className="font-mono text-[length:calc(11px*var(--copy-scale))] tracking-[0.15em] text-[var(--color-text-secondary)]">
                                            {project.year}
                                        </span>
                                        <span aria-hidden className="h-px flex-1 bg-[var(--color-border)]" />
                                    </div>
                                )}
                                <ProjectCard
                                    project={project}
                                    open={openId === project.id}
                                    onToggle={() => setOpenId(openId === project.id ? '' : project.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
