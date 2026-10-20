'use client';

import type { Research, ResearchInstance } from '@tarek/content';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
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
    selectedProjectId: string | null;
    onSelectProject: (id: string | null) => void;
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

function StackedTimeline({ tracks, minYear, maxYear, currentYear, selectedProjectId, onSelectProject }: TimelineProps) {
    const span = Math.max(1, maxYear - minYear);
    const position = (year: number) => ((year - minYear) / span) * 92;
    const ticks = Array.from(new Set(Array.from({ length: 4 }, (_, i) => Math.round(minYear + ((maxYear - minYear) * i) / 3))));

    return (
        <>
            <p className={styles.guidance}>Select a project to show its panel below.</p>
            {tracks.map((track) => {
                const { document } = track;
                const groups = groupByYear(track.ms);
                const height = Math.max(54, Math.max(0, ...groups.map(([, group]) => group.length)) * 10 + 24);
                return (
                    <button
                        key={document.id}
                        type="button"
                        className={styles.stackedProject}
                        aria-pressed={selectedProjectId === document.id}
                        aria-controls="research-project-view"
                        onClick={() => onSelectProject(document.id)}
                    >
                        <span className={styles.projectHeading}>
                            <span className={styles.projectTitle}>{document.title}</span>
                            <span className={styles.date}>{document.yearsDisplay}</span>
                        </span>
                        <span className={styles.trackButton} aria-hidden="true">
                            <span className={styles.horizontalTrack} style={{ height }}>
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
                            <span className={styles.stackedAxis}>
                                {ticks.map((year) => (
                                    <span key={year} data-current={year === currentYear || undefined} style={{ left: `${position(year)}%` }}>
                                        {year}
                                    </span>
                                ))}
                            </span>
                        </span>
                    </button>
                );
            })}
        </>
    );
}

function ScrollTimeline({ tracks, minYear, maxYear, currentYear, selectedProjectId, onSelectProject }: TimelineProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
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

    return (
        <>
            <p id="scroll-guidance" className={styles.guidance}>Swipe through the years. Select a lane to show its project below.</p>
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
                            <button
                                key={track.document.id}
                                type="button"
                                className={styles.scrollRow}
                                style={{ minHeight: height }}
                                aria-pressed={selectedProjectId === track.document.id}
                                aria-controls="research-project-view"
                                onClick={() => onSelectProject(track.document.id)}
                            >
                                <span className={styles.stickyTitle}>
                                    <span className={styles.projectTitle}>{track.document.title}</span>
                                    <span className={styles.date}>{track.document.yearsDisplay}</span>
                                </span>
                                <span className={styles.scrollTrack} style={{ width }} aria-hidden="true">
                                    {years.map((year) => (
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
                                                bottom: 12 + (group.length - 1 - index) * 10 + (!track.document.ongoing && year === track.endYear ? 10 : 0),
                                            }}
                                        />
                                    )))}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function VerticalTimeline({ tracks, minYear, maxYear, currentYear, selectedProjectId, onSelectProject }: TimelineProps) {
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const position = (year: number) => (year - minYear) * 44 + 22;

    return (
        <>
            <p className={styles.guidance}>Select a project name or lane to show its panel below.</p>
            <div className={styles.selector} role="group" aria-label="Choose a research project">
                {tracks.map((track, index) => (
                    <button
                        key={track.document.id}
                        type="button"
                        aria-pressed={selectedProjectId === track.document.id}
                        aria-controls="research-project-view"
                        onClick={() => onSelectProject(track.document.id)}
                    >
                        <span className={styles.date} aria-hidden="true">{index + 1}</span>
                        <span>{track.document.title}</span>
                    </button>
                ))}
            </div>
            <div
                className={styles.verticalScore}
                style={{ height: years.length * 44 }}
                role="group"
                aria-label={`Research from ${minYear} to ${maxYear}, oldest at the top. Tracks follow the numbered project selector.`}
            >
                {years.map((year) => (
                    <div
                        key={year}
                        className={styles.verticalYear}
                        data-current={year === currentYear || undefined}
                        style={{ top: position(year) }}
                        aria-hidden="true"
                    >
                        <span>{year}</span>
                    </div>
                ))}
                <div className={styles.lanes} style={{ gridTemplateColumns: `repeat(${tracks.length}, minmax(0, 1fr))` }}>
                    {tracks.map((track, index) => (
                        <button
                            key={track.document.id}
                            type="button"
                            className={styles.lane}
                            aria-label={track.document.title}
                            aria-pressed={selectedProjectId === track.document.id}
                            aria-controls="research-project-view"
                            onClick={() => onSelectProject(track.document.id)}
                        >
                            <span aria-hidden="true">
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
                            </span>
                        </button>
                    ))}
                </div>
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
                {props.selectedProjectId && (
                    <button type="button" className={styles.clearSelection} aria-label="Show all projects" onClick={() => props.onSelectProject(null)}>
                        <span aria-hidden="true">×</span> Show all
                    </button>
                )}
            </p>
            {variant === 'stacked' && <StackedTimeline {...props} />}
            {variant === 'scroll' && <ScrollTimeline {...props} />}
            {variant === 'vertical' && <VerticalTimeline {...props} />}
        </div>
    );
}
