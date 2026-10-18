'use client';

import { useSiteData } from '@/data/SiteDataProvider';
import { mediaUrl } from '@/lib/mediaUrl';

export default function Bio() {
    const { about } = useSiteData();
    const paragraphs = [about.text, about.exhibitions, about.performances, about.groupExhibitions, about.collections].filter(Boolean);

    return (
        <section id="about">
            <div className="md:flex md:items-start">
                {about.portraitURL && (
                    <div className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh] overflow-hidden md:sticky md:top-[10vh]">
                        <img src={mediaUrl(about.portraitURL)} alt={about.portraitAlt} className="w-full h-full object-cover object-top" />
                        <figcaption className="absolute bottom-0 right-0 px-4 py-2 text-[length:calc(11px*var(--copy-scale))] text-white/70 font-light tracking-[0.02em] bg-black/30 backdrop-blur-sm">
                            {about.portraitCredit}
                        </figcaption>
                    </div>
                )}

                <div
                    className={`${about.portraitURL ? 'md:w-1/2' : 'w-full'} px-[clamp(24px,4vw,64px)] pt-[clamp(24px,3vw,40px)] pb-[clamp(40px,6vw,72px)] space-y-[1.8em]`}
                >
                    {paragraphs.map((paragraph) => (
                        <p
                            key={paragraph}
                            className="whitespace-pre-line text-[length:calc(clamp(15px,1.15vw,17px)*var(--copy-scale))] font-light leading-[1.8] text-[var(--color-text)]"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}
