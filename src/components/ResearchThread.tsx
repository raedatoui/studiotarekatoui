'use client';

import MediaSlider from '@/components/MediaSlider';
import { getTheme, projectsForTheme, themePlaces } from '@/data/projects';
import { useSiteData } from '@/data/SiteDataProvider';
import { collectGalleryMedia } from '@/lib/media';
import { mediaUrl } from '@/lib/mediaUrl';

/** Research text, presentation timeline, and a shared gallery of images and films. */
const THIS_YEAR = new Date().getFullYear();

/** One fact in the horizontal meta row under the description. */
function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="max-w-[44ch]">
            <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">{label}</dt>
            <dd className="mt-2.5 text-[length:calc(clamp(16px,1.4vw,20px)*var(--copy-scale))] font-light leading-snug">{value}</dd>
        </div>
    );
}

export default function ResearchThread({ themeId }: { themeId: string }) {
    const theme = getTheme(themeId);
    const { portfolio } = useSiteData();
    if (!theme) {
        return null;
    }

    // Newest first, same order as /chronology.
    const ms = [...projectsForTheme(themeId)].sort((a, b) => b.year - a.year || (b.dateStart ?? '').localeCompare(a.dateStart ?? ''));
    // "Live" = something is happening right now; only then do the ongoing dots pulse.
    const live = ms.some((m) => m.status === 'current');
    const places = themePlaces(themeId);
    const work = theme.portfolioId ? portfolio.find((w) => w.id === theme.portfolioId) : undefined;
    const { slides, references } = collectGalleryMedia(work?.images ?? [], ms, theme.media);

    return (
        <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(32px,6vh,72px)] pb-[clamp(32px,5vw,56px)]">
                <a
                    className="thread-rise font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-accent)]"
                    href="/research"
                >
                    ← Long-term research
                </a>
                <div className="thread-rise mt-[clamp(20px,3vw,36px)] flex items-center gap-3 font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.22em] [animation-delay:60ms]">
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
                    <p className="text-[length:calc(clamp(17px,1.9vw,27px)*var(--copy-scale))] font-light leading-[1.55]">{theme.description[0]}</p>
                    {theme.description.length > 1 && (
                        <div className="mt-[clamp(24px,3vw,40px)] space-y-5">
                            {theme.description.slice(1).map((paragraph) => (
                                <p key={paragraph} className="text-[length:calc(clamp(14px,1.05vw,16px)*var(--copy-scale))] font-light leading-[1.8]">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <dl className="mt-[clamp(28px,4vw,48px)] flex flex-wrap gap-x-[clamp(40px,6vw,96px)] gap-y-7 border-t border-[var(--color-border)] pt-[clamp(20px,2.5vw,32px)]">
                    {places.length > 0 && <MetaItem label="Places" value={places.map((p) => p.split(',')[0]).join(' · ')} />}
                    {theme.materials && theme.materials.length > 0 && <MetaItem label="Material" value={theme.materials.join(' · ')} />}
                    {theme.collaborators && theme.collaborators.length > 0 && <MetaItem label="With" value={theme.collaborators.join(', ')} />}
                </dl>
            </section>

            {/* ── Where & when — vertical timeline ───────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(40px,6vw,80px)]">
                <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Where &amp; when</h2>
                    <p className="hidden font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:block">
                        {ms.length} {ms.length === 1 ? 'presentation' : 'presentations'}
                    </p>
                </div>

                <ol className="mt-2 [--timeline-mark-y:calc(1rem+0.8rem*var(--copy-scale))]">
                    {ms.map((m, index) => {
                        const place = [m.city, m.country].filter(Boolean).join(', ');
                        return (
                            <li key={m.id} id={`project-${m.id}`} className="relative">
                                {index < ms.length - 1 && (
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
                                            m.year === THIS_YEAR ? 'bg-[var(--color-recent)]' : 'bg-[var(--color-text)] opacity-55'
                                        }`}
                                    />
                                    <span className="font-mono text-[length:calc(12px*var(--copy-scale))] text-[var(--color-accent)]">{m.year}</span>
                                    <span>
                                        <span className="text-[length:calc(15px*var(--copy-scale))] leading-snug">{m.title ?? m.venue}</span>
                                        <span className="mt-1 block text-[length:calc(12.5px*var(--copy-scale))] font-light text-[var(--color-text-secondary)]">
                                            {m.kind}
                                            {m.title && ` · ${m.venue}`}
                                            {place && ` — ${place}`}
                                        </span>
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </section>

            {/* ── Gallery — all presentations and portfolio media ────── */}
            {slides.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(56px,8vw,112px)]">
                    <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5 mb-[clamp(24px,3vw,40px)]">
                        <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Gallery</h2>
                    </div>
                    <MediaSlider items={slides} title={theme.title} />
                </section>
            )}

            {references.length > 0 && (
                <section aria-labelledby="press-heading" className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(56px,8vw,112px)]">
                    <h2
                        id="press-heading"
                        className="border-t border-[var(--color-border)] pt-5 font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]"
                    >
                        Press
                    </h2>
                    <ul className="mt-5">
                        {references.map((reference) => (
                            <li key={reference.src} className="border-b border-[var(--color-border)]">
                                <a href={mediaUrl(reference.src)} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-6 py-5">
                                    <span>
                                        <span className="block font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                                            {reference.publisher} · {reference.type === 'external' ? 'Reference' : reference.type === 'press' ? 'Article' : reference.type}
                                        </span>
                                        <span className="mt-2 block text-[length:calc(clamp(14px,1.2vw,18px)*var(--copy-scale))] font-light leading-relaxed group-hover:text-[var(--color-accent)]">
                                            {reference.caption}
                                        </span>
                                    </span>
                                    <span aria-hidden className="text-[var(--color-accent)]">↗</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}
