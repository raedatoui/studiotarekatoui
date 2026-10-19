'use client';

import type { Research, ResearchInstance } from '@tarek/content';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './MobileResearchTimeline.module.css';

export type MobileTimelineVariant = 'stacked' | 'scroll' | 'vertical';

type Track = {
    document: Research;
    ms: ResearchInstance[];
    startYear: number;
    endYear: number;
};

type TimelineProps = {
    tracks: Track[];
    minYear: number;
    maxYear: number;
    currentYear: number;
};

const variants = [
    { id: 'stacked', title: 'Stacked timelines' },
    { id: 'scroll', title: 'Swipeable chart' },
    { id: 'vertical', title: 'Vertical tracks' },
] as const;

function groupByYear(instances: ResearchInstance[]) {
    const groups = new Map<number, ResearchInstance[]>();
    for (const instance of instances) {
        const group = groups.get(instance.year) ?? [];
        group.push(instance);
        groups.set(instance.year, group);
    }
    return Array.from(groups);
}

export function ResearchLabNavigation({ variant }: { variant: MobileTimelineVariant }) {
    return (
        <nav className={styles.navigation} aria-label="Research timeline previews">
            {variants.map(({ id, title }) => (
                <Link key={id} href={`/research-lab/${id}#projects`} aria-current={variant === id ? 'page' : undefined}>
                    {title}
                </Link>
            ))}
        </nav>
    );
}

function Presentations({ instances, currentYear }: { instances: ResearchInstance[]; currentYear: number }) {
    return instances.length ? (
        <ol className={styles.presentations}>
            {instances.map((instance) => {
                const place = [instance.city, instance.country].filter(Boolean).join(', ');
                return (
                    <li key={instance.id}>
                        <span className={styles.date} data-current={instance.year === currentYear || undefined}>
                            {instance.year}
                        </span>
                        <div>
                            <p>{instance.title ?? instance.organization}</p>
                            {instance.title && <p className={styles.secondary}>{instance.organization}</p>}
                            {place && <p className={styles.secondary}>{place}</p>}
                            <p className={styles.date}>{instance.dateDisplay}</p>
                        </div>
                    </li>
                );
            })}
        </ol>
    ) : (
        <p className={styles.guidance}>No presentations listed.</p>
    );
}

function Lifeline({ track, start, end }: { track: Track; start: number; end: number }) {
    return (
        <>
            <span className={styles.lifeline} style={{ left: `${start}%`, width: `${end - start}%` }} />
            {track.document.ongoing ? (
                <span className={styles.tail} style={{ left: `${end}%` }} />
            ) : (
                <span className={styles.end} style={{ left: `${end}%` }} />
            )}
        </>
    );
}

function StackedTimeline({ tracks, minYear, maxYear, currentYear }: TimelineProps) {
    const [openId, setOpenId] = useState<string | null>(null);
    const span = Math.max(1, maxYear - minYear);
    const position = (year: number) => ((year - minYear) / span) * 92;
    const ticks = Array.from(new Set(Array.from({ length: 4 }, (_, i) => Math.round(minYear + ((maxYear - minYear) * i) / 3))));

    return (
        <>
            <p className={styles.guidance}>Tap a track to show its presentations. Titles lead to the project below.</p>
            {tracks.map((track) => {
                const { document } = track;
                const groups = groupByYear(track.ms);
                const open = openId === document.id;
                const height = Math.max(54, Math.max(0, ...groups.map(([, group]) => group.length)) * 10 + 24);
                return (
                    <div key={document.id} className={styles.stackedProject}>
                        <div className={styles.projectHeading}>
                            <a className={styles.projectTitle} href={`#thread-${document.id}`}>{document.title}</a>
                            <span className={styles.date}>{document.yearsDisplay}</span>
                        </div>
                        <button
                            type="button"
                            className={styles.trackButton}
                            aria-expanded={open}
                            aria-controls={`stacked-details-${document.id}`}
                            aria-label={`${document.title}: ${track.ms.length} presentations. ${open ? 'Hide' : 'Show'} details`}
                            onClick={() => setOpenId(open ? null : document.id)}
                        >
                            <span className={styles.horizontalTrack} style={{ height }} aria-hidden="true">
                                {ticks.map((year) => (
                                    <span key={year} className={styles.gridline} style={{ left: `${position(year)}%` }} />
                                ))}
                                <Lifeline track={track} start={position(track.startYear)} end={position(track.endYear)} />
                                {groups.flatMap(([year, group]) => group.map((instance, index) => (
                                    <span
                                        key={instance.id}
                                        className={styles.dot}
                                        data-current={year === currentYear || undefined}
                                        style={{
                                            left: `${position(year)}%`,
                                            bottom: 12 + (group.length - 1 - index) * 10 + (!document.ongoing && year === track.endYear ? 10 : 0),
                                        }}
                                    />
                                )))}
                            </span>
                            <span className={styles.stackedAxis} aria-hidden="true">
                                {ticks.map((year) => (
                                    <span key={year} data-current={year === currentYear || undefined} style={{ left: `${position(year)}%` }}>
                                        {year}
                                    </span>
                                ))}
                            </span>
                            <span className={styles.disclosureLabel}>{open ? 'Hide' : 'Show'} {track.ms.length} presentations {open ? '−' : '+'}</span>
                        </button>
                        <div id={`stacked-details-${document.id}`} hidden={!open} className={styles.details}>
                            <Presentations instances={track.ms} currentYear={currentYear} />
                        </div>
                    </div>
                );
            })}
        </>
    );
}

function ScrollTimeline({ tracks, minYear, maxYear, currentYear }: TimelineProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const detailsRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [selection, setSelection] = useState<{ track: Track; year: number } | null>(null);
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const width = years.length * 56;
    const position = (year: number) => ((year - minYear + 0.5) / years.length) * 100;

    useEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;
        // The chart may mount hidden on desktop. Initialize when it first becomes visible.
        const observer = new ResizeObserver(() => {
            if (!scroller.clientWidth) return;
            scroller.scrollLeft = scroller.scrollWidth;
            observer.disconnect();
        });
        observer.observe(scroller);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (selection) detailsRef.current?.focus();
    }, [selection]);

    const closeDetails = () => {
        setSelection(null);
        triggerRef.current?.focus();
    };

    return (
        <>
            <p id="scroll-guidance" className={styles.guidance}>Swipe through the years. Tap a marked year for details below the chart.</p>
            <div ref={scrollRef} className={styles.scroller} role="region" aria-label="Research timeline" aria-describedby="scroll-guidance" tabIndex={0}>
                <div style={{ width: 112 + width }}>
                    <div className={styles.scrollRow}>
                        <span className={`${styles.stickyTitle} ${styles.date}`}>Project</span>
                        <div className={styles.scrollAxis} style={{ width }}>
                            {years.map((year) => (
                                <span key={year} data-current={year === currentYear || undefined}>{year}</span>
                            ))}
                        </div>
                    </div>
                    {tracks.map((track) => {
                        const groups = groupByYear(track.ms);
                        const height = Math.max(116, Math.max(0, ...groups.map(([, group]) => group.length)) * 10 + 32);
                        return (
                            <div key={track.document.id} className={styles.scrollRow} style={{ minHeight: height }}>
                                <div className={styles.stickyTitle}>
                                    <a className={styles.projectTitle} href={`#thread-${track.document.id}`}>{track.document.title}</a>
                                    <span className={styles.date}>{track.document.yearsDisplay}</span>
                                </div>
                                <div className={styles.scrollTrack} style={{ width }}>
                                    {years.map((year) => (
                                        <span key={year} className={styles.gridline} style={{ left: `${position(year)}%` }} aria-hidden="true" />
                                    ))}
                                    <span aria-hidden="true">
                                        <Lifeline track={track} start={position(track.startYear)} end={position(track.endYear)} />
                                    </span>
                                    {groups.map(([year, group]) => {
                                        const selected = selection?.track.document.id === track.document.id && selection.year === year;
                                        return (
                                            <button
                                                key={year}
                                                type="button"
                                                className={styles.yearButton}
                                                style={{ left: `${position(year)}%` }}
                                                aria-label={`${track.document.title}, ${year}: ${group.length} presentations`}
                                                aria-expanded={selected}
                                                aria-controls="scroll-details"
                                                onClick={(event) => {
                                                    triggerRef.current = event.currentTarget;
                                                    setSelection({ track, year });
                                                }}
                                            >
                                                {group.map((instance, index) => (
                                                    <span
                                                        key={instance.id}
                                                        className={styles.dot}
                                                        data-current={year === currentYear || undefined}
                                                        aria-hidden="true"
                                                        style={{
                                                            left: '50%',
                                                            bottom: 12 + (group.length - 1 - index) * 10 + (!track.document.ongoing && year === track.endYear ? 10 : 0),
                                                        }}
                                                    />
                                                ))}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div
                id="scroll-details"
                ref={detailsRef}
                className={styles.details}
                hidden={!selection}
                tabIndex={-1}
                role="region"
                aria-labelledby="scroll-details-heading"
                onKeyDown={(event) => { if (event.key === 'Escape') closeDetails(); }}
            >
                {selection && (
                    <>
                        <div className={styles.detailHeading}>
                            <h3 id="scroll-details-heading" className={styles.projectTitle}>
                                <a href={`#thread-${selection.track.document.id}`}>{selection.track.document.title}</a>
                                <span className={styles.date}>{selection.year}</span>
                            </h3>
                            <button type="button" className={styles.closeButton} onClick={closeDetails}>Close</button>
                        </div>
                        <Presentations instances={selection.track.ms.filter((instance) => instance.year === selection.year)} currentYear={currentYear} />
                    </>
                )}
            </div>
        </>
    );
}

function VerticalTimeline({ tracks, minYear, maxYear, currentYear }: TimelineProps) {
    const [selectedId, setSelectedId] = useState(tracks[0]?.document.id);
    const selected = tracks.find((track) => track.document.id === selectedId);
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const position = (year: number) => (year - minYear) * 44 + 22;

    return (
        <>
            <p className={styles.guidance}>Choose a project to follow its track. Presentations appear below the score.</p>
            <div className={styles.selector} role="group" aria-label="Choose a research project">
                {tracks.map((track, index) => (
                    <button
                        key={track.document.id}
                        type="button"
                        aria-pressed={selectedId === track.document.id}
                        aria-controls="vertical-score vertical-details"
                        onClick={() => setSelectedId(track.document.id)}
                    >
                        <span className={styles.date} aria-hidden="true">{index + 1}</span>
                        <span>{track.document.title}</span>
                    </button>
                ))}
            </div>
            <p className={styles.selectionStatus} role="status">
                {selected && `${selected.document.title}: ${selected.ms.length} presentations. ${selected.document.ongoing ? 'Ongoing' : 'Concluded'}.`}
            </p>
            <div
                id="vertical-score"
                className={styles.verticalScore}
                style={{ height: years.length * 44 }}
                role="img"
                aria-label={`Research from ${minYear} to ${maxYear}, oldest at the top. Tracks follow the numbered project selector. ${selected?.document.title ?? 'No project'} highlighted; its presentation details follow.`}
            >
                {years.map((year) => (
                    <div key={year} className={styles.verticalYear} data-current={year === currentYear || undefined} style={{ top: position(year) }}>
                        <span>{year}</span>
                    </div>
                ))}
                <div className={styles.lanes} style={{ gridTemplateColumns: `repeat(${tracks.length}, minmax(0, 1fr))` }}>
                    {tracks.map((track, index) => (
                        <div key={track.document.id} className={styles.lane} data-selected={selectedId === track.document.id || undefined}>
                            <span className={styles.laneNumber}>{index + 1}</span>
                            <span
                                className={styles.verticalLine}
                                style={{ top: position(track.startYear), height: position(track.endYear) - position(track.startYear) }}
                            />
                            {track.document.ongoing ? (
                                <span className={styles.verticalTail} style={{ top: position(track.endYear) }} />
                            ) : (
                                <span className={styles.verticalEnd} style={{ top: position(track.endYear) }} />
                            )}
                            {groupByYear(track.ms).flatMap(([year, group]) => group.map((instance, index) => {
                                const finalYear = !track.document.ongoing && year === track.endYear;
                                const gap = Math.min(8, 32 / group.length);
                                const offset = finalYear ? -(group.length - index) * Math.min(8, 20 / group.length) : (index - (group.length - 1) / 2) * gap;
                                return (
                                    <span
                                        key={instance.id}
                                        className={styles.dot}
                                        data-current={year === currentYear || undefined}
                                        style={{ left: '50%', top: position(year) + offset }}
                                    />
                                );
                            }))}
                        </div>
                    ))}
                </div>
            </div>
            <div id="vertical-details" className={styles.details}>
                {selected && (
                    <>
                        <h3 className={styles.projectTitle}><a href={`#thread-${selected.document.id}`}>{selected.document.title}</a></h3>
                        <p className={styles.date}>{selected.document.yearsDisplay}</p>
                        <Presentations instances={selected.ms} currentYear={currentYear} />
                    </>
                )}
            </div>
        </>
    );
}

export default function MobileResearchTimeline({ variant, ...props }: TimelineProps & { variant: MobileTimelineVariant }) {
    return (
        <div className={styles.mobile}>
            <p className={styles.legend}>
                <span className={styles.legendDot} aria-hidden="true" /> Presentation
                <span className={styles.legendDot} data-current aria-hidden="true" /> {props.currentYear}
                <span className={styles.legendLine} aria-hidden="true" /> Ongoing
                <span className={styles.legendEnd} aria-hidden="true" /> Concluded
            </p>
            {variant === 'stacked' && <StackedTimeline {...props} />}
            {variant === 'scroll' && <ScrollTimeline {...props} />}
            {variant === 'vertical' && <VerticalTimeline {...props} />}
        </div>
    );
}
