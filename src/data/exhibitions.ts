export interface SubExhibition {
    title: string;
    dateDisplay: string;
    location: string;
}

export interface Exhibition {
    venue: string;
    title?: string;
    dateDisplay: string;
    organization?: string;
    location?: string;
    work?: string;
    url?: string;
    subExhibitions?: SubExhibition[];
}

export const soloShows: Exhibition[] = [
    {
        venue: 'MATHAF: Arab Museum of Modern Art, Doha, Qatar',
        title: 'Waters\u2019 Witness',
        dateDisplay: 'December 16, 2025 \u2013 May 18, 2026',
        url: 'https://mathaf.org.qa/en/calendar/waters-witness-by-tarek-atoui/',
    },
    {
        venue: 'AlWarsha, AlUla, Saudi Arabia',
        title: 'Phonolites',
        dateDisplay: 'February 1 \u2013 April 15, 2026',
        organization: 'Royal Commission for AlUla',
        url: 'https://www.crousel.com/actualite/tarek-atoui-phonolites-2026-02-01/',
    },
    {
        venue: 'IMMA, Dublin, Ireland',
        dateDisplay: '',
        url: 'https://imma.ie/whats-on/tarek-atoui-exhibition/',
        subExhibitions: [
            {
                title: 'Sunflowers',
                dateDisplay: 'February 21 \u2013 July 19, 2026',
                location: 'Gallery 3',
            },
            {
                title: 'Souffle Continu',
                dateDisplay: 'February 21 \u2013 April 19, 2026',
                location: 'Chapel',
            },
        ],
    },
    {
        venue: 'Tate, London, UK',
        title: 'Hyundai Commission',
        dateDisplay: 'October 13, 2026 \u2013 April 11, 2027',
        organization: 'The Turbine Hall \u2014 Hyundai Motor and Tate Partnership',
        url: 'https://www.tate.org.uk/press/press-releases/tarek-atoui-to-create-the-next-hyundai-commission-for-tate-moderns-turbine-hall',
    },
];

export const groupShows: Exhibition[] = [
    {
        venue: 'Haus der Kunst, Munich, Germany',
        title: 'For Children. Art Stories since 1968',
        dateDisplay: 'July 17, 2025 \u2013 May 31, 2026',
        work: 'band camp (2025)',
        url: 'https://www.hausderkunst.de/en/eintauchen/for-children-art-stories-since-1968',
    },
    {
        venue: 'Black Gold Museum, Riyadh',
        dateDisplay: 'Opening 2026 (TBC)',
        work: 'Black Gold Alchemy (2024)',
    },
];
