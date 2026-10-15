'use client';

import MediaSlider from '@/components/MediaSlider';
import VerticalTimeline from '@/components/VerticalTimeline';
import type { Research } from '@tarek/content';
import { gallerySlides } from '@/lib/media';
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

export default function ResearchThread({ research }: { research: Research }) {
    const ms = research.instances;
    const live = ms.some((event) => event.status === 'current');
    const places = Array.from(new Set(ms.flatMap((event) => (event.city ? [event.country ? `${event.city}, ${event.country}` : event.city] : []))));
    const slides = gallerySlides(research.gallery);
    const references = research.press;

    return (
        <main className="bg-[var(--color-bg)] text-[var(--color-text)] max-sm:[&>section:last-child]:pb-6">
            {/* ── Hero ───────────────────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pt-[clamp(32px,6vh,72px)] max-sm:pt-6 pb-[clamp(32px,5vw,56px)]">
                <a
                    className="research-jump-link thread-rise font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em]"
                    href="/research"
                >
                    ← Long-term research
                </a>
                <div className="thread-rise mt-[clamp(20px,3vw,36px)] flex items-center gap-3 font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.22em] [animation-delay:60ms]">
                    {research.ongoing ? (
                        <span className="flex items-center gap-2 text-[var(--color-accent)]">
                            <span className={`h-[7px] w-[7px] rounded-full bg-[var(--color-accent)] ${live ? 'thread-pulse' : ''}`} />
                            ongoing
                        </span>
                    ) : (
                        <span className="text-[var(--color-text-secondary)]">concluded</span>
                    )}
                    <span className="text-[var(--color-text-secondary)]">{research.yearsDisplay}</span>
                </div>
                <h1 className="thread-rise mt-4 font-[family-name:var(--font-display)] text-[clamp(40px,6.5vw,92px)] font-normal leading-[0.98] tracking-[-0.01em] [animation-delay:120ms]">
                    {research.title}
                </h1>
                {research.subtitle && (
                    <p className="thread-rise mt-2 font-[family-name:var(--font-display)] text-[clamp(18px,2.2vw,28px)] italic text-[var(--color-text-secondary)] [animation-delay:180ms]">
                        {research.subtitle}
                    </p>
                )}
            </section>

            {/* ── The thread, in full ────────────────────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(40px,6vw,80px)]">
                <div className="border-t border-[var(--color-border)] pt-[clamp(28px,4vw,48px)]">
                    {/* lede — first paragraph carries the width on its own */}
                    <p className="text-[length:calc(clamp(17px,1.9vw,27px)*var(--copy-scale))] font-light leading-[1.55]">{research.description[0] ?? research.summary}</p>
                    {research.description.length > 1 && (
                        <div className="mt-[clamp(24px,3vw,40px)] space-y-5">
                            {research.description.slice(1).map((paragraph) => (
                                <p key={paragraph} className="text-[length:calc(clamp(14px,1.05vw,16px)*var(--copy-scale))] font-light leading-[1.8]">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <dl className="mt-[clamp(28px,4vw,48px)] flex flex-wrap gap-x-[clamp(40px,6vw,96px)] gap-y-7 border-t border-[var(--color-border)] pt-[clamp(20px,2.5vw,32px)]">
                    {research.organizations.length > 0 && <MetaItem label="Organizations" value={research.organizations.join(' · ')} />}
                    {places.length > 0 && <MetaItem label="Places" value={places.map((place) => place.split(',')[0]).join(' · ')} />}
                    {research.materials && research.materials.length > 0 && <MetaItem label="Material" value={research.materials.join(' · ')} />}
                    {research.collaborators && research.collaborators.length > 0 && <MetaItem label="With" value={research.collaborators.join(', ')} />}
                </dl>
            </section>

            {/* ── Where & when — vertical timeline ───────────────────── */}
            <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(40px,6vw,80px)]">
                <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5">
                    <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                        Where &amp; when
                    </h2>
                    <p className="hidden font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)] sm:block">
                        {ms.length} {ms.length === 1 ? 'presentation' : 'presentations'}
                    </p>
                </div>

                <VerticalTimeline entries={ms} />
            </section>

            {/* ── Gallery — research and presentation images and films ────── */}
            {slides.length > 0 && (
                <section className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] pb-[clamp(56px,8vw,112px)]">
                    <div className="flex items-baseline justify-between border-t border-[var(--color-border)] pt-5 mb-[clamp(24px,3vw,40px)]">
                        <h2 className="font-mono text-[length:calc(11px*var(--copy-scale))] uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
                            Gallery
                        </h2>
                    </div>
                    <MediaSlider key={JSON.stringify(research.gallery)} items={slides} title={research.title} />
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
                            <li key={reference.url} className="border-b border-[var(--color-border)]">
                                <a
                                    href={mediaUrl(reference.url)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-start justify-between gap-6 py-5"
                                >
                                    <span>
                                        <span className="block font-mono text-[length:calc(10px*var(--copy-scale))] uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                                            {reference.publisher ?? new URL(reference.url).hostname.replace(/^www\./, '')} ·{' '}
                                            {reference.type === 'external' ? 'Reference' : reference.type === 'press' ? 'Article' : reference.type}
                                        </span>
                                        <span className="mt-2 block text-[length:calc(clamp(14px,1.2vw,18px)*var(--copy-scale))] font-light leading-relaxed group-hover:text-[var(--color-accent)]">
                                            {reference.title}
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
