export interface PortfolioWork {
    id: string;
    title: string;
    year: string;
    description: string[];
    images: { src: string; caption: string }[];
}

export const portfolioWorks: PortfolioWork[] = [
    {
        id: 'at-tariq',
        title: 'At-Tāriq',
        year: '2023 —',
        description: [
            'A Majlis is a traditional space of hospitality in Arab and North African homes, where guests are received and offered shelter and conviviality. This ethos of hospitality animates Tarek Atoui’s long-term research project and exhibition At-Tāriq, meaning “The Nightcomer” or “The Morning Star.”',
            'Over the years, Atoui has developed an artistic practice rooted in research and fieldwork, traveling extensively to connect with the musical heritage of different cultures. In At-Tāriq, he retraces trans-Saharan routes of pilgrimage and trade, exploring rural musical forms of the Arab world and North Africa.',
            'Building on Atoui’s compositional approach, which fuses traditional and contemporary expressions of sound, performance, and craftsmanship, At-Tāriq is activated by a suite of experimental sonic objects. Suspended from the ceiling in layered stacks, these kinetic object-instruments produce textured tonalities that seem to emerge from the mineral and material elements of the Atlas Mountains. Made by Amazigh artisans, these objects carry the imprint of generations of knowledge and material sensibilities.',
            'At-Tāriq also functions as a living archive of Arab and Amazigh music, translated into an electroacoustic “soundtrack” composed and performed with Atoui’s collaborators. Developed during a residency in Córdoba with percussionist Susie Ibarra, musician Nancy Mounir, and DJ-composer Ziúr — and later expanded with other contributors, this layered composition circulates through the objects and reverberates across the Majlis spaces.',
        ],
        images: [
            { src: '/portfolio/at-tariq/performance-diriyah-biennale-2024.jpg', caption: 'At-Tāriq, performance, Diriyah Biennale, Riyadh, 2024' },
            { src: '/portfolio/at-tariq/exhibition-tba-madrid-2025.jpg', caption: 'Exhibition view, TBA, Madrid, 2025 — Photo: Lourdes Cabrera' },
            { src: '/portfolio/at-tariq/sahara-chapter-thomaskerk.jpg', caption: 'The Sahara Chapter, Thomaskerk, Hartwig Art Foundation — Photo: Maarten Nauw' },
            { src: '/portfolio/at-tariq/studio-view-2025-a.jpg', caption: 'Studio view, 2025 — Courtesy Galerie Chantal Crousel' },
            { src: '/portfolio/at-tariq/studio-view-2025-b.jpg', caption: 'Studio view, 2025 — Courtesy Galerie Chantal Crousel' },
            { src: '/portfolio/at-tariq/doundoun-details-studio-2025.jpg', caption: 'Doundoun, studio view, 2025 — Courtesy Galerie Chantal Crousel' },
            { src: '/portfolio/at-tariq/details-studio-view-by-alexandre-guirkinger.jpg', caption: 'Details, studio view — Photo: Alexandre Guirkinger' },
            { src: '/portfolio/at-tariq/atlas-pottery-studio.jpg', caption: 'Pottery from the Atlas region, studio view — Photo: Alexandre Guirkinger' },
        ],
    },
    {
        id: 'the-wind-harvesters',
        title: 'The Wind Harvesters',
        year: '2023',
        description: [
            'The Wind Harvesters #1 is an air circuit inspired by the water irrigation systems of rice fields in the area of Chiang Rai. It is made out of bamboo sections into which traditional wind instruments from the Akha and Lisu tribes were mounted and tuned by Atoui, the musicians and the instrument makers from these communities.',
            'A computer-based composition translates the sound of the traditional wind instruments into water and hidden sound flows creating an intricate composition and listening situation for the audience visiting the work. The artist also conceived the space of this composition and its elements as a hospitality and performance ground for the members of these tribes and other musicians during the time of the exhibition.',
        ],
        images: [
            { src: '/portfolio/the-wind-harvesters/img-002.jpg', caption: 'Installation view, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-003.jpg', caption: 'Installation view, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-004.jpg', caption: 'Installation views, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-005.jpg', caption: 'Installation views, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-006.jpg', caption: 'Instrument details, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-007.jpg', caption: 'Instrument details, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-008.jpg', caption: 'Instrument details, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
            { src: '/portfolio/the-wind-harvesters/img-009.jpg', caption: 'Instrument details, Thailand Biennale at Mae Fah Luang Park, Chiang Rai, 2023' },
        ],
    },
    {
        id: 'the-rain',
        title: 'The Rain',
        year: '2023',
        description: [
            'The Rain offers a unique fusion of Korean traditional percussion instruments and electronic soundscapes, introducing visitors to an entirely novel way of experiencing sound.',
            "Atoui's journey began in 2019 when he embarked on a research expedition to South Korea. During this exploration, he developed a profound fascination with Korean traditional culture, extending his interest beyond traditional instruments to include ceramics, porcelain, hanji (traditional Korean paper), weaving, and more. Through collaborations with artisans, craftsmen, and scholars of traditional culture, he has created instruments and forms that reflect his distinctive artistic style.",
        ],
        images: [
            { src: '/portfolio/the-rain/img-010.jpg', caption: 'Exhibition view, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-011.jpg', caption: 'Hanging Structures, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-012.jpg', caption: 'Hanging Structures, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-013.jpg', caption: 'Hanging Structures, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-014.jpg', caption: 'Micro city - unit 3, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-015.jpg', caption: 'Micro city - unit 2 (detail), Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-016.jpg', caption: 'Water Drum - unit 1, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-017.jpg', caption: 'Items, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-018.jpg', caption: 'Items, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-019.jpg', caption: 'Ceramics detail, Art Sonje Center, Seoul (South Korea), 2023' },
            { src: '/portfolio/the-rain/img-020.jpg', caption: 'Mallets detail, Art Sonje Center, Seoul (South Korea), 2023' },
        ],
    },
    {
        id: 'the-whisperers',
        title: 'The Whisperers',
        year: '2021 \u2014',
        description: [
            'The Whisperers conceived by Tarek Atoui is a series of listening devices composed of different materials that conduct and amplify sound in multi-sensory ways. These assemblages bring together plastic, wood, brass, water, bronze, glass and stone, experimenting with each material acoustic properties and the unique ways they transmit and reflect sound. Through The Whisperers, Atoui invites the visitor to plug-in their own music and experience it in fresh and innovative ways, they offer a medium for discovery and unpredictable, undoing the familiar and known.',
            "Tarek Atoui has created a new series of The Whisperers in 2021 influenced and inspired by five workshop sessions that took place between November 2020 and June 2021 in a kindergarten classroom, l'\u00c9cole alsacienne in Paris, with 5-year-old students.",
        ],
        images: [
            { src: '/portfolio/the-whisperers/img-021.jpg', caption: 'Installation view, The FLAG Art Foundation, New York, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-022.jpg', caption: 'Installation view, The FLAG Art Foundation, New York, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-023.jpg', caption: 'Installation view, The FLAG Art Foundation, New York, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-024.jpg', caption: 'Installation view, The FLAG Art Foundation, New York, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-025.jpg', caption: 'Installation view, The FLAG Art Foundation, New York, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-026.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-027.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-028.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-029.jpg', caption: 'The Whisperers, module detail' },
            { src: '/portfolio/the-whisperers/img-030.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-031.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-032.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-033.jpg', caption: 'Installation view, The FLAG Art Foundation, New York, USA, 2022' },
            { src: '/portfolio/the-whisperers/img-034.jpg', caption: 'The Whisperers / Module 1, 2021' },
            { src: '/portfolio/the-whisperers/img-035.jpg', caption: 'Installation view, Galerie Chantal Crousel, Paris, France, 2021' },
            { src: '/portfolio/the-whisperers/img-036.jpg', caption: 'Installation view, Galerie Chantal Crousel, Paris, France, 2021' },
            { src: '/portfolio/the-whisperers/img-037.jpg', caption: 'The Whisperers / Module 3, 2021' },
        ],
    },
    {
        id: 'waters-witness',
        title: "Waters' Witness",
        year: '2020 \u2014',
        description: [
            "Waters' Witness is based on the ongoing project I/E Tarek Atoui initiated in 2015. Drawing upon research made in collaboration with the musicians and composers Chris Watson and Eric La Casa, Tarek Atoui uses sound recordings to document the human, ecological, historical and industrial realities of coastal cities that have a past rooted in their docklands, such as Athens, Abu Dhabi, Singapore, Beirut and Porto. Working in close proximity to or under the water, Atoui uses various recording techniques to capture the sounds of the sea and docks, and materials such as metal, stone and wood.",
            "The first iteration of Waters' Witness took place at the Fridericianum in Kassel in 2020, followed by a new version in the Serralves Museum of Contemporary Art in 2022. Then, Waters' Witness was presented in 2022 at the Mudam Luxembourg and in 2023 at the MCA Sydney.",
        ],
        images: [
            { src: '/portfolio/waters-witness/img-038.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-039.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-040.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-041.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-042.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-043.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-044.jpg', caption: 'Installation view, MCA Sydney, Sydney, Australia, 2023' },
            { src: '/portfolio/waters-witness/img-045.jpg', caption: 'Mudam Luxembourg, Luxembourg, 2022' },
            { src: '/portfolio/waters-witness/img-046.jpg', caption: 'Mudam Luxembourg, Luxembourg, 2022' },
            { src: '/portfolio/waters-witness/img-047.jpg', caption: 'Mudam Luxembourg, Luxembourg, 2022' },
            { src: '/portfolio/waters-witness/img-048.jpg', caption: 'Serralves Museum, Porto, Portugal, 2022' },
            { src: '/portfolio/waters-witness/img-049.jpg', caption: 'Serralves Museum, Porto, Portugal, 2022' },
            { src: '/portfolio/waters-witness/img-050.jpg', caption: 'Fridericianum, Kassel, Germany, 2020' },
            { src: '/portfolio/waters-witness/img-051.jpg', caption: 'I/E Elefsina, recording sessions, Elefsina, Greece, 2015' },
        ],
    },
    {
        id: 'the-wave',
        title: 'The Wave',
        year: '2019',
        description: [
            'The Wave is a composition deriving from experimentation that Tarek Atoui has been doing with the instruments and sounds constituting the piece. The instruments were developed for WITHIN, The Reverse Collection and The Ground, Atoui\u2019s previous projects. The sounds are field recordings from I/E, Atoui\u2019s project on harbour cities (Abu Dhabi, Athens and Singapore). Since their creation, these sound libraries and instruments have been activated by a variety of collaborators and musicians. Some were deaf, interacting with sound and performance for the first time; others were professional musicians familiar with improvisation and extended techniques. The Wave is inspired by these individual and collective encounters.',
            'Instruments are animated by objects and sound, and sounds are broadcast through metal and stone. The listening space that is created is a delicate ever-changing microcosm that repeatedly gets washed away by the Horns of Putin and then builds up again.',
        ],
        images: [
            { src: '/portfolio/the-wave/img-052.jpg', caption: 'The Wave, 2019' },
            { src: '/portfolio/the-wave/img-053.jpg', caption: 'The Wave, 2019' },
            { src: '/portfolio/the-wave/img-054.jpg', caption: 'The Wave, 2019' },
            { src: '/portfolio/the-wave/img-055.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-wave/img-056.jpg', caption: 'Installation view, The Contemporary Austin, Austin, USA, 2022' },
            { src: '/portfolio/the-wave/img-057.jpg', caption: 'Installation view, If The Snake, Okayama Art summit, Okayama, Japan, 2019' },
            { src: '/portfolio/the-wave/img-058.jpg', caption: 'The Wave, 2019 \u2014 Detail' },
        ],
    },
    {
        id: 'the-ground',
        title: 'The Ground',
        year: '2018',
        description: [
            'Combining visual, tactile and aural modes of perceiving sound, this composition is the result of five years of travel Atoui undertook in the Pearl River Delta in southern China, where he observed local practices of farming and the architectural environment. During this time, Atoui recorded his observations of contemporary and traditional agricultural, architectural and musical practices from the region in a booklet that he shared with craftsmen and instrument makers, who then interpreted the information in their work.',
            'The resulting instruments were set up by Atoui to play separately and autonomously at exhibitions, first in Guangzhou and later in Singapore, where various artists and musicians were invited to respond to both the forms and sounds of the work. At the Venice Biennale (2019), the piece was presented as a completed composition and listening space based on the project\u2019s previous iterations.',
        ],
        images: [
            { src: '/portfolio/the-ground/img-059.jpg', caption: 'The Ground, 2018 \u2014 Mixed media' },
            { src: '/portfolio/the-ground/img-060.jpg', caption: 'Installation view, 58th International Art Exhibition \u2014 La Biennale di Venezia, 2019' },
            { src: '/portfolio/the-ground/img-061.jpg', caption: 'Installation view, 58th International Art Exhibition \u2014 La Biennale di Venezia, 2019' },
        ],
    },
    {
        id: 'within',
        title: 'WITHIN',
        year: '2016\u20132017 \u2014',
        description: [
            'WITHIN investigates how deafness can influence the way we understand sound, sound performance and concert situations. Reflecting a deaf person\u2019s perspective, WITHIN also questions the act of listening and the way we build instruments, conduct, improvise, write scores and relate to an audience. Initiated in 2013 with Sharjah Art Foundation and Al Amal School for the Deaf, and enriched by the contribution of the curatorial duo Council (Sandra Terdjman and Gregory Castera), WITHIN further evolved at the Experimental Music and Performing Art Center, Rensselaer, US (2015); Berkeley Art Museum, US (2015); Bergen Assembly, Norway (2016); ZKM, Karlsruhe, Germany (2016); Galerie Chantal Crousel, Paris (2017); Garage Museum of Contemporary Art, Moscow (2018); and CentroCentro, Madrid (2019).',
            'Throughout this journey, Tarek Atoui conceived an ensemble of 11 musical instruments that address both deaf and hearing people, and these instruments have been played by hundreds of professionals and amateurs, both deaf and hearing. Today, the project is expanding notions of listening beyond the aural, and its principles rely on modes of tactile, physical, visual and gestural sound perception.',
        ],
        images: [
            { src: '/portfolio/within/img-062.jpg', caption: 'Workshop, WITHIN, Bergen Assembly, Bergen, Norway, 2016' },
            { src: '/portfolio/within/img-063.jpg', caption: 'Workshop, WITHIN, Bergen Assembly, Bergen, Norway, 2016' },
            { src: '/portfolio/within/img-064.jpg', caption: '33 Soft Cells, 2016' },
            { src: '/portfolio/within/img-065.jpg', caption: 'Sub-ink #1, 2016' },
            { src: '/portfolio/within/img-066.jpg', caption: 'Workshop, WITHIN, Bergen Assembly, Bergen, Norway, 2016' },
            { src: '/portfolio/within/img-067.jpg', caption: 'WITHIN, performance, Bergen Assembly, Bergen, Norway, 2016' },
            { src: '/portfolio/within/img-068.jpg', caption: 'WITHIN, performance, Bergen Assembly, Bergen, Norway, 2016' },
        ],
    },
    {
        id: 'the-reverse-collection',
        title: 'The Reverse Collection',
        year: '2016\u20132021',
        description: [
            'Between October 2013 and May 2014, Tarek Atoui invited 18 experimental musicians from around the world to select and improvise on the instrument collection of the Dahlem Ethnological Museum in Berlin. Devoid of any historical or anthropological information, they engaged with the instruments intuitively, using unconventional techniques and objects to produce sounds. On 30 May and 1 June 2014, Atoui presented a series of 12 live performances at the Dahlem Museum. Composed and directed by the artist, Dahlem Sessions was performed in front of a small audience and meticulously recorded.',
            'Tarek Atoui took audio excerpts recorded in the Dahlem Sessions as a starting point for The Reverse Collection and collaborating with instrument makers on imagining and building the objects that could have generated these recordings. Without involving any images, Atoui proposed to engage with sound directly \u2014 contrary to the usual path of ethnomusicology, which studies the shape and mechanism of an instrument with an emphasis on its cultural and social context.',
        ],
        images: [
            { src: '/portfolio/the-reverse-collection/img-069.jpg', caption: 'The Reverse Collection, 2016-2021' },
            { src: '/portfolio/the-reverse-collection/img-070.jpg', caption: 'The Reverse Collection, 2016-2021 \u2014 Detail' },
            { src: '/portfolio/the-reverse-collection/img-071.jpg', caption: 'Exhibition view, Tate Modern, London, U.K., 2016' },
        ],
    },
    {
        id: 'the-metastable-circuit-1',
        title: 'The Metastable Circuit 1',
        year: '2012',
        description: [
            'Tarek Atoui created an autonomous electroacoustic instrument called the Metastable Circuit 1 especially for dOCUMENTA (13) in Kassel: a networked ensemble of desks made of computers, hard and software, controllers, touchpads, conductors and wired interface and control boards that continuously generates new stories and collages from a seemingly inexhaustible source of concrete sound material.',
        ],
        images: [
            { src: '/portfolio/the-metastable-circuit-1/img-072.jpg', caption: 'Metastable Circuit 1, 2012' },
            { src: '/portfolio/the-metastable-circuit-1/img-073.jpg', caption: 'Metastable Circuit 1, 2012' },
        ],
    },
    {
        id: 'on-and-from-tarab',
        title: 'On and From Tarab',
        year: '2011\u20132012',
        description: [
            'There is no word in English that accurately translates the word Tarab from Arabic to English, which makes it very difficult to define. Tarab is used in Arab culture to describe the emotional effect of music, but it is also associated with a traditional form of art-music. The word \u2018Tarab\u2019 refers to an older repertoire, which is rooted in the pre World War I musical practice of Egypt and the East-Mediterranean Arab world and is directly associated with emotional evocation. Tarab sessions are known to last hours where both enchantment and ecstasy play an important role within the Tarab performance.',
            'The starting point of this project is the private music collection of Kamal Kassar who owns the biggest library of Tarab and classical Arab music in the world. The project is about revisiting Tarab as musical genre and form as well as looking at it from a sound & performative perspectives.',
        ],
        images: [
            { src: '/portfolio/on-and-from-tarab/img-074.jpg', caption: 'Revisiting Tarab, Sharjah Art Foundation, United Arab Emirates, 2011' },
            { src: '/portfolio/on-and-from-tarab/img-075.jpg', caption: 'La Suite, Serpentine Gallery, London, 2011-2012' },
            { src: '/portfolio/on-and-from-tarab/img-076.jpg', caption: 'La Suite, Serpentine Gallery, London, 2011-2012' },
        ],
    },
];
