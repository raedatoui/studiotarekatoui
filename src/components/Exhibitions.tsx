import { groupShows, soloShows } from '@/data/exhibitions';
import ExhibitionCard from './ExhibitionCard';

export default function Exhibitions() {
    return (
        <section id="exhibitions" className="py-[clamp(48px,6vw,80px)] px-[clamp(24px,4vw,64px)]">
            <div className="max-w-[520px] mx-auto text-center">
                <div className="mb-12">
                    <h2 className="text-[clamp(20px,2vw,28px)] font-bold mb-6">Exhibitions</h2>
                    {soloShows.map((show, i) => (
                        <ExhibitionCard key={show.venue} exhibition={show} id={i === soloShows.length - 1 ? 'upcoming' : undefined} />
                    ))}
                </div>

                <div className="mb-12">
                    <h2 className="text-[clamp(20px,2vw,28px)] font-bold mb-6">Group exhibitions</h2>
                    {groupShows.map((show) => (
                        <ExhibitionCard key={show.venue} exhibition={show} />
                    ))}
                </div>
            </div>
        </section>
    );
}
