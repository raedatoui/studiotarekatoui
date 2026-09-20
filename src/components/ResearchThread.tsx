'use client';

import MediaSlider from '@/components/MediaSlider';
import { useSiteData } from '@/data/SiteDataProvider';
import { collectGalleryMedia } from '@/lib/media';
import { mediaUrl } from '@/lib/mediaUrl';

/** One fact in the horizontal meta row under the description. */
function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="max-w-[44ch]">
            <dt className="font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                {label}
            </dt>
            <dd className="mt-2.5 text-[length:calc(clamp(16px,1.4vw,20px)*var(--copy-scale))] font-light leading-snug">{value}</dd>
        </div>
    );
}

export default function ResearchThread({ themeId }: { themeId: string }) {
    const { themes } = useSiteData();
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) {
        return null;
    }

    const { slides, references } = collectGalleryMedia(theme.images ?? [], theme.media);

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
                            <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-accent)]" />
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
                    {theme.materials && theme.materials.length > 0 && <MetaItem label="Material" value={theme.materials.join(' · ')} />}
                    {theme.collaborators && theme.collaborators.length > 0 && <MetaItem label="With" value={theme.collaborators.join(', ')} />}
                </dl>
            </section>

            {/* ── Gallery — research images and films ────── */}
            {slides.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(56px,8vw,112px)]">
                    <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5 mb-[clamp(24px,3vw,40px)]">
                        <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                            Gallery
                        </h2>
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
                                <a
                                    href={mediaUrl(reference.src)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-start justify-between gap-6 py-5"
                                >
                                    <span>
                                        <span className="block font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                                            {reference.publisher} ·{' '}
                                            {reference.type === 'external' ? 'Reference' : reference.type === 'press' ? 'Article' : reference.type}
                                        </span>
                                        <span className="mt-2 block text-[length:calc(clamp(14px,1.2vw,18px)*var(--copy-scale))] font-light leading-relaxed group-hover:text-[var(--color-accent)]">
                                            {reference.caption}
                                        </span>
                                    </span>
                                    <span aria-hidden className="text-[var(--color-accent)]">
                                        ↗
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
}
