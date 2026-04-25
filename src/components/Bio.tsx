import { en } from '@/i18n/en';

const bioKeys = ['bio.text', 'bio.exhibitions', 'bio.performances', 'bio.groupExhibitions', 'bio.collections'] as const;

export default function Bio() {
    return (
        <section id="about">
            <div className="md:flex md:items-start">
                {/* Portrait image */}
                <div className="relative w-full md:w-1/2 h-[60vh] md:h-[80vh] overflow-hidden md:sticky md:top-[10vh]">
                    <img src="/images/portrait-tarek-atoui.jpg" alt={en['bio.photoAlt']} className="w-full h-full object-cover object-top" />
                    <figcaption className="absolute bottom-0 right-0 px-4 py-2 text-[11px] text-white/70 font-light tracking-[0.02em] bg-black/30 backdrop-blur-sm">
                        {en['bio.photoCredit']}
                    </figcaption>
                </div>

                {/* Bio text */}
                <div className="md:w-1/2 px-[clamp(24px,4vw,64px)] pt-[clamp(24px,3vw,40px)] pb-[clamp(40px,6vw,72px)] space-y-[1.8em]">
                    {bioKeys.map((key) => (
                        <p key={key} className="text-[clamp(15px,1.15vw,17px)] font-light leading-[1.8] text-[var(--color-text)]">
                            {en[key]}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}
