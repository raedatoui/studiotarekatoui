'use client';

import { useSiteData } from '@/data/SiteDataProvider';
import ExhibitionCard from './ExhibitionCard';

export default function News() {
    const { news } = useSiteData();
    const upcomingIndex = news.solo.findIndex((show) => show.status === 'upcoming');

    return (
        <section id="news" className="py-[clamp(48px,6vw,80px)] px-[clamp(24px,4vw,64px)]">
            <div className="max-w-[520px] mx-auto text-center">
                {news.sectionOrder.map(({ section }, sectionIndex) => {
                    const Heading = sectionIndex === 0 ? 'h1' : 'h2';
                    return (
                        <div key={section} className="mb-12">
                            <Heading className="text-[clamp(20px,2vw,28px)] font-bold mb-6">{news[`${section}Heading`]}</Heading>
                            {news[section].map((show, i) => (
                                <ExhibitionCard
                                    key={`${show.venue}-${i}`}
                                    exhibition={show}
                                    id={section === 'solo' && i === upcomingIndex ? 'upcoming' : undefined}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
