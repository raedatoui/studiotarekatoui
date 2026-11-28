import { Gutter, Link } from '@payloadcms/ui';
import { Instrument_Serif } from 'next/font/google';
import type { AdminViewServerProps } from 'payload';
import { findDrafts } from '../publish/endpoints';
import { SavedDrafts } from './SavedDrafts';

// The website's display face, so each part of the site is named here the way the website sets it.
const serif = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--studio-serif' });

type Area = {
    name: string;
    /** Where the page can be seen, when it is not on the public website yet. */
    note?: string;
    description: string;
    links: { label: string; href: string; allowed: boolean | undefined }[];
};

function Areas({ id, title, areas }: { id: string; title: string; areas: Area[] }) {
    const visible = areas.map((area) => ({ ...area, links: area.links.filter((link) => link.allowed) })).filter((area) => area.links.length > 0);
    if (visible.length === 0) return null;

    return (
        <section className="studio-home__section" aria-labelledby={id}>
            <h2 id={id}>{title}</h2>
            <ul className="studio-home__index">
                {visible.map((area) => (
                    <li key={area.name} className="studio-home__area">
                        <div>
                            <h3 className="studio-home__name">{area.name}</h3>
                            {area.note && <p className="studio-home__note">{area.note}</p>}
                        </div>
                        <div className="studio-home__body">
                            <p>{area.description}</p>
                            <ul className="studio-home__links">
                                {area.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} prefetch={false}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

/** The CMS home: every part of the website in one index, with saved drafts first. */
export async function HomeView({ initPageResult: { permissions }, payload }: AdminViewServerProps) {
    const admin = payload.config.routes.admin;
    const drafts = await findDrafts(payload);
    const collections = permissions.collections ?? {};
    const globals = permissions.globals ?? {};

    const pages: Area[] = [
        {
            name: 'Research',
            description: 'Projects with their events, images, videos and press, and the page heading and introduction.',
            links: [
                { label: 'Edit projects', href: `${admin}/collections/research`, allowed: collections.research?.read },
                { label: 'Add a project', href: `${admin}/collections/research/create`, allowed: collections.research?.create },
                { label: 'Edit heading and introduction', href: `${admin}/globals/research-page`, allowed: globals['research-page']?.read },
            ],
        },
        {
            name: 'News',
            description: 'The website’s home page: exhibitions, group exhibitions, installations and performances, and their order.',
            links: [{ label: 'Edit News', href: `${admin}/globals/news`, allowed: globals.news?.read }],
        },
        {
            name: 'Chronology',
            note: 'Test site only',
            description: 'The full project timeline, with dates, locations, collaborators and documentation.',
            links: [
                { label: 'Edit entries', href: `${admin}/globals/chronology`, allowed: globals.chronology?.read },
                { label: 'Add an entry', href: `${admin}/globals/chronology?addProject=1`, allowed: globals.chronology?.update },
                { label: 'Edit heading and introduction', href: `${admin}/globals/chronology/introduction`, allowed: globals.chronology?.read },
            ],
        },
        {
            name: 'Publications',
            note: 'Test site only',
            description: 'Books and records with their covers, prices and availability, and the page heading and introduction.',
            links: [
                { label: 'Edit publications', href: `${admin}/collections/publications`, allowed: collections.publications?.read },
                { label: 'Add a publication', href: `${admin}/collections/publications/create`, allowed: collections.publications?.create },
                { label: 'Edit heading and introduction', href: `${admin}/globals/publications-page`, allowed: globals['publications-page']?.read },
            ],
        },
        {
            name: 'About',
            description: 'The biography, exhibition and performance lists, collections and portrait.',
            links: [{ label: 'Edit About', href: `${admin}/globals/about`, allowed: globals.about?.read }],
        },
        {
            name: 'Contact',
            description: 'The heading, text and email address.',
            links: [{ label: 'Edit Contact', href: `${admin}/globals/contact`, allowed: globals.contact?.read }],
        },
    ];

    const settings: Area[] = [
        {
            name: 'Navigation',
            description: 'Menu labels, links and order, for desktop and mobile.',
            links: [{ label: 'Edit menu', href: `${admin}/globals/navigation`, allowed: globals.navigation?.read }],
        },
        {
            name: 'Users',
            description: 'Google accounts that have signed in to the CMS.',
            links: [{ label: 'View accounts', href: `${admin}/collections/users`, allowed: collections.users?.read }],
        },
    ];

    return (
        <Gutter>
            <div className={`studio-home ${serif.variable}`}>
                <header className="studio-home__intro">
                    <h1 className="studio-home__title">Studio Tarek Atoui</h1>
                    <p>
                        Choose a part of the website to edit. Published edits reach the website the next time you use{' '}
                        <Link href={`${admin}/publish`} prefetch={false}>
                            Publish website
                        </Link>
                        .
                    </p>
                    <p className="studio-home__meta">
                        <Link href={`${admin}/guide`} prefetch={false}>
                            Managing content and pages
                        </Link>{' '}
                        explains where everything is edited and how publishing works.
                    </p>
                </header>

                {drafts.length > 0 && (
                    <section className="studio-home__drafts" aria-labelledby="studio-home-drafts-title">
                        <h2 id="studio-home-drafts-title">Saved drafts</h2>
                        <p>
                            Edits saved in the CMS and not published yet. The website leaves drafts out. Open one to review it. Where a published
                            version exists, <strong>Draft changes</strong> shows what differs.
                        </p>
                        <SavedDrafts admin={admin} drafts={drafts} />
                    </section>
                )}

                <Areas id="studio-home-pages" title="Website pages" areas={pages} />
                <Areas id="studio-home-settings" title="Menu and accounts" areas={settings} />
            </div>
        </Gutter>
    );
}
