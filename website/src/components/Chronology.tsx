'use client';

import { useState } from 'react';
import type { Chronology as ChronologyContent, Project, Research } from '@tarek/content';
import { mediaUrl } from '@/lib/mediaUrl';
import VerticalTimeline from './VerticalTimeline';

function ProjectDetails({ project, research }: { project: Project; research: Research[] }) {
    const themes = project.needsReview ? [] : research.filter((theme) => project.themeIds.includes(theme.slug));
    if (!project.note && !project.organization && !project.collaborators.length && !project.media.length && !themes.length) return null;
    return (
        <details className="mt-3 text-[length:calc(12.5px*var(--copy-scale))] font-light leading-relaxed">
            <summary className="cursor-pointer text-[var(--color-text-secondary)]">Details &amp; documentation</summary>
            <div className="mt-3 space-y-2">
                {project.organization && <p>{project.organization}</p>}
                {project.note && <p>{project.note}</p>}
                {project.collaborators.length > 0 && <p>With {project.collaborators.join(', ')}</p>}
                {themes.length > 0 && (
                    <ul className="flex flex-wrap gap-x-4 gap-y-2">
                        {themes.map((theme) => (
                            <li key={theme.id}>
                                <a className="research-title-link" href={`/research/${theme.slug}`}>
                                    {theme.title} →
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
                {project.media.length > 0 && (
                    <ul className="space-y-2">
                        {project.media.map((item, index) => (
                            <li key={`${index}-${item.url}`}>
                                <a href={mediaUrl(item.url)} target="_blank" rel="noreferrer" className="research-title-link">
                                    {item.label ?? item.type}
                                    {item.publisher ? ` — ${item.publisher}` : ''} ↗
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </details>
    );
}

export default function Chronology({ content, research }: { content: ChronologyContent; research: Research[] }) {
    const [year, setYear] = useState('all');
    const [kind, setKind] = useState('all');
    const projects = [...content.projects].sort((a, b) => b.year - a.year);
    const years = [...new Set(projects.map((project) => project.year))];
    const kinds = [...new Set(projects.map((project) => project.kind))].sort();
    const shown = projects.filter((project) => (year === 'all' || project.year === Number(year)) && (kind === 'all' || project.kind === kind));
    const shownYears = [...new Set(shown.map((project) => project.year))];
    const selectClass = 'ml-3 border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)]';

    return (
        <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(32px,6vh,72px)] pb-[clamp(32px,5vw,56px)]">
                <h1 className="thread-rise font-[family-name:var(--font-display)] text-[clamp(40px,6.5vw,92px)] font-normal leading-[0.98] tracking-[-0.01em]">
                    {content.heading}
                </h1>
                {content.introduction && (
                    <p className="mt-6 max-w-[62ch] text-[length:calc(clamp(15px,1.3vw,18px)*var(--copy-scale))] font-light leading-relaxed">
                        {content.introduction}
                    </p>
                )}
            </section>
            <section aria-label="Project timeline" className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(40px,6vw,80px)]">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-[var(--color-border)] py-4 font-mono text-[length:calc(11px*var(--copy-scale))]">
                    <label>
                        Year
                        <select className={selectClass} value={year} onChange={(event) => setYear(event.target.value)}>
                            <option value="all">All years</option>
                            {years.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Kind
                        <select className={selectClass} value={kind} onChange={(event) => setKind(event.target.value)}>
                            <option value="all">All kinds</option>
                            {kinds.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>
                    <p aria-live="polite">
                        {shown.length} / {projects.length} projects
                    </p>
                    {(year !== 'all' || kind !== 'all') && (
                        <button
                            type="button"
                            className="cursor-pointer research-title-link"
                            onClick={() => {
                                setYear('all');
                                setKind('all');
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
                {shownYears.map((groupYear) => (
                    <section key={groupYear} aria-labelledby={`year-${groupYear}`} className="mt-[clamp(32px,4vw,56px)]">
                        <div className="flex items-center gap-5 pb-3">
                            <h2
                                id={`year-${groupYear}`}
                                className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,52px)] leading-none text-[var(--color-accent)]"
                            >
                                {groupYear}
                            </h2>
                            <span aria-hidden className="h-px flex-1 bg-[var(--color-border)]" />
                        </div>
                        <VerticalTimeline
                            entries={shown
                                .filter((project) => project.year === groupYear)
                                .map((project) => ({
                                    ...project,
                                    organization: project.venue,
                                    dateDisplay: project.dateDisplay ?? project.dateStart?.slice(0, 10),
                                    details: <ProjectDetails project={project} research={research} />,
                                }))}
                        />
                    </section>
                ))}
                {!shown.length && <p className="py-12 text-[var(--color-text-secondary)]">No projects in this selection.</p>}
            </section>
        </main>
    );
}
