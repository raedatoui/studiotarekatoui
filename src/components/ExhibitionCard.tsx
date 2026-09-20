import type { Exhibition } from '@/data/schema';

export default function ExhibitionCard({ exhibition, id }: { exhibition: Exhibition; id?: string }) {
    const content = (
        <div className="space-y-[2px]">
            {exhibition.subExhibitions ? (
                <>
                    <div className="text-[length:calc(15px*var(--copy-scale))] font-normal">{exhibition.venue}</div>
                    {exhibition.subExhibitions.map((sub) => (
                        <div key={sub.title} className="pl-0">
                            <span className="italic">{sub.title}</span>
                            <span className="text-[var(--color-text-secondary)]">
                                , {sub.dateDisplay} ({sub.location})
                            </span>
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {exhibition.title && <span className="italic">{exhibition.title}</span>}
                    {exhibition.title && <br />}
                    <span className="font-normal">{exhibition.venue}</span>
                    <br />
                    <span className="text-[var(--color-text-secondary)]">{exhibition.dateDisplay}</span>
                    {exhibition.organization && (
                        <>
                            <br />
                            <span className="text-[var(--color-text-secondary)] text-[length:calc(13px*var(--copy-scale))]">
                                {exhibition.organization}
                            </span>
                        </>
                    )}
                    {exhibition.location && (
                        <>
                            <br />
                            <span className="text-[var(--color-text-secondary)] text-[length:calc(13px*var(--copy-scale))]">
                                {exhibition.location}
                            </span>
                        </>
                    )}
                    {exhibition.work && (
                        <>
                            <br />
                            <span className="text-[var(--color-text-secondary)] text-[length:calc(13px*var(--copy-scale))]">
                                <em>{exhibition.work.split(' (')[0]}</em>
                                {exhibition.work.includes('(') && ` (${exhibition.work.split(' (')[1]}`}
                            </span>
                        </>
                    )}
                </>
            )}
        </div>
    );

    if (exhibition.url) {
        return (
            <a
                id={id}
                className="block py-3 text-[length:calc(15px*var(--copy-scale))] leading-[1.6] hover:opacity-70 transition-opacity duration-200"
                href={exhibition.url}
                target="_blank"
                rel="noopener"
            >
                {content}
            </a>
        );
    }

    return (
        <div id={id} className="py-3 text-[length:calc(15px*var(--copy-scale))] leading-[1.6]">
            {content}
        </div>
    );
}
