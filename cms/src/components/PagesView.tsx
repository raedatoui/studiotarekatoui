import { DefaultTemplate } from '@payloadcms/next/templates';
import { Gutter, Link, SetStepNav, Table } from '@payloadcms/ui';
import type { AdminViewServerProps, Column } from 'payload';
import { cmsPages } from '../globals/pages';
import { PublicationDate, PublishedByCell } from './PublicationCells';

export async function PagesView(props: AdminViewServerProps) {
    const { initPageResult: { req, permissions, visibleEntities }, payload } = props;
    const pages = await Promise.all(cmsPages.filter(({ slug }) => permissions.globals?.[slug]?.read).map(async ({ slug, label }) => {
        const [published, latest] = await Promise.all([
            payload.findGlobal({
                slug, req, draft: false, depth: 0, overrideAccess: false,
                select: { _status: true, updatedAt: true, publishedBy: true },
            }),
            payload.findGlobal({ slug, req, draft: true, depth: 0, overrideAccess: false, select: { _status: true } }),
        ]);
        const isPublished = published._status === 'published';
        return {
            id: slug,
            label,
            href: `${payload.config.routes.admin}/globals/${slug}`,
            status: latest._status === 'published' ? 'Published' : 'Draft',
            lastPublishedAt: isPublished ? published.updatedAt : null,
            publishedBy: isPublished ? published.publishedBy : null,
        };
    }));
    const columns: Column[] = [
        {
            accessor: 'label', active: true, field: { name: 'label', type: 'text' }, Heading: 'Page',
            renderedCells: pages.map((page) => <Link key={page.id} href={page.href} prefetch={false}>{page.label}</Link>),
        },
        {
            accessor: 'status', active: true, field: { name: 'status', type: 'text' }, Heading: 'Status',
            renderedCells: pages.map((page) => page.status),
        },
        {
            accessor: 'lastPublishedAt', active: true, field: { name: 'lastPublishedAt', type: 'date' }, Heading: 'Last published',
            renderedCells: pages.map((page) => <PublicationDate key={page.id} value={page.lastPublishedAt} />),
        },
        {
            accessor: 'publishedBy', active: true, field: { name: 'publishedBy', type: 'text' }, Heading: 'Published by',
            renderedCells: pages.map((page) => <PublishedByCell key={page.id} cellData={page.publishedBy} rowData={page} />),
        },
    ];

    return (
        <DefaultTemplate {...props} req={req} permissions={permissions} visibleEntities={visibleEntities}>
            <SetStepNav nav={[{ label: 'Pages' }]} />
            <Gutter>
                <h1>Pages</h1>
                <Table columns={columns} data={pages} />
            </Gutter>
        </DefaultTemplate>
    );
}
