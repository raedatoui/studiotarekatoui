'use client';

import { useSiteData } from '@/data/SiteDataProvider';
import { mediaUrl } from '@/lib/mediaUrl';

const priceFormatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

export default function Publications() {
    const { publications } = useSiteData();

    return (
        <section id="publications" aria-labelledby="publications-heading" className="px-[clamp(24px,4vw,64px)] py-[clamp(48px,6vw,80px)]">
            <h1 id="publications-heading" className="text-[clamp(20px,2vw,28px)] font-bold mb-[clamp(40px,5vw,64px)]">
                Publications
            </h1>
            {publications.length === 0 ? (
                <p className="text-[var(--color-text-secondary)]">Publications will be available here soon.</p>
            ) : (
                <ul className="space-y-[clamp(56px,7vw,96px)]">
                    {publications.map((publication, index) => (
                        <li key={publication.id}>
                            <article
                                aria-labelledby={`publication-${publication.id}`}
                                className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-[clamp(40px,6vw,88px)]"
                            >
                                <figure className="min-w-0">
                                    <img
                                        src={mediaUrl(publication.imageURL)}
                                        alt={`Cover of ${publication.title}`}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        className="w-full aspect-[4/5] object-contain object-left-top"
                                    />
                                    {publication.imageCredit && (
                                        <figcaption className="mt-3 text-[length:calc(11px*var(--copy-scale))] leading-relaxed text-[var(--color-text-secondary)]">
                                            {publication.imageCredit}
                                        </figcaption>
                                    )}
                                </figure>
                                <div className="min-w-0 max-w-[65ch]">
                                    <h2 id={`publication-${publication.id}`} className="text-[clamp(22px,2.4vw,32px)] font-normal leading-[1.25]">
                                        {publication.title}
                                    </h2>
                                    <dl className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-[length:calc(14px*var(--copy-scale))]">
                                        <div>
                                            <dt className="sr-only">Year</dt>
                                            <dd className="text-[var(--color-text-secondary)]">{publication.year}</dd>
                                        </div>
                                        {publication.price !== undefined && (
                                            <div>
                                                <dt className="sr-only">Price</dt>
                                                <dd>{priceFormatter.format(publication.price)}</dd>
                                            </div>
                                        )}
                                        {publication.availability === 'out-of-print' && (
                                            <div>
                                                <dt className="sr-only">Availability</dt>
                                                <dd className="text-[var(--color-text-secondary)]">Out of print</dd>
                                            </div>
                                        )}
                                    </dl>
                                    <p className="mt-6 whitespace-pre-line text-[length:calc(clamp(14px,1.1vw,16px)*var(--copy-scale))] font-light leading-[1.8]">
                                        {publication.body}
                                    </p>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
