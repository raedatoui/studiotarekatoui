import type { ReactNode } from 'react';
import type { ResearchInstance } from '@tarek/content';

type TimelineEntry = Omit<ResearchInstance, 'dateDisplay'> & { dateDisplay?: string; details?: ReactNode };
const THIS_YEAR = new Date().getFullYear();

export default function VerticalTimeline({ entries }: { entries: TimelineEntry[] }) {
    return (
        <ol className="mt-2 [--timeline-mark-y:calc(1rem+0.8rem*var(--copy-scale))]">
            {entries.map((entry, index) => {
                const place = [entry.city, entry.country].filter(Boolean).join(', ');
                return (
                    <li key={entry.id} id={`project-${entry.id}`} className="relative">
                        {index < entries.length - 1 && (
                            <span
                                aria-hidden
                                className="pointer-events-none absolute top-[var(--timeline-mark-y)] bottom-[calc(-1*var(--timeline-mark-y))] left-[48px] w-px bg-[var(--color-text)] opacity-30"
                            />
                        )}
                        <span aria-hidden className="absolute right-0 bottom-0 left-[64px] h-px bg-[var(--color-border)]" />
                        <div className="relative grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-4 py-4">
                            <span
                                aria-hidden
                                className={`absolute top-[var(--timeline-mark-y)] left-[48px] h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full ${
                                    entry.year === THIS_YEAR ? 'bg-[var(--color-recent)]' : 'bg-[var(--color-text)] opacity-55'
                                }`}
                            />
                            <span className="font-mono text-[length:calc(12px*var(--copy-scale))] text-[var(--color-accent)]">{entry.year}</span>
                            <div>
                                <span className="text-[length:calc(15px*var(--copy-scale))] leading-snug">
                                    {entry.url ? (
                                        <a href={entry.url} target="_blank" rel="noreferrer" className="research-title-link">
                                            {entry.title ?? entry.organization} ↗
                                        </a>
                                    ) : (
                                        (entry.title ?? entry.organization)
                                    )}
                                </span>
                                <span className="mt-1 block text-[length:calc(12.5px*var(--copy-scale))] font-light text-[var(--color-text-secondary)]">
                                    {entry.kind}
                                    {entry.status ? ` · ${entry.status}` : ''}
                                    {entry.title && ` · ${entry.organization}`}
                                    {place && ` — ${place}`}
                                    {entry.dateDisplay && ` · ${entry.dateDisplay}`}
                                </span>
                                {entry.details}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
