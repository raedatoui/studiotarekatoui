'use client';

import { useSiteData } from '@/data/SiteDataProvider';
import ExhibitionCard from './ExhibitionCard';

export default function News() {
    const {
        news: { solo, group, soloHeading, groupHeading },
    } = useSiteData();

    return (
        <section id="news" className="py-[clamp(48px,6vw,80px)] px-[clamp(24px,4vw,64px)]">
            <div className="max-w-[520px] mx-auto text-center">
                <div className="mb-12">
                    <h1 className="text-[clamp(20px,2vw,28px)] font-bold mb-6">{soloHeading}</h1>
                    {solo.map((show, i) => (
                        <ExhibitionCard key={`${show.venue}-${i}`} exhibition={show} id={i === solo.findIndex((item) => item.status === 'upcoming') ? 'upcoming' : undefined} />
                    ))}
                </div>

                <div className="mb-12">
                    <h2 className="text-[clamp(20px,2vw,28px)] font-bold mb-6">{groupHeading}</h2>
                    {group.map((show, i) => (
                        <ExhibitionCard key={`${show.venue}-${i}`} exhibition={show} />
                    ))}
                </div>
            </div>
        </section>
    );
}
