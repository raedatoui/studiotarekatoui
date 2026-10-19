import type { Field } from 'payload';

export function publishedByField(): Field {
    return {
        name: 'publishedBy',
        type: 'text',
        label: 'Published by',
        disableDuplicate: true,
        access: { create: () => false, update: () => false },
        admin: {
            readOnly: true,
            hidden: true,
            position: 'sidebar',
            disableBulkEdit: true,
            disableListColumn: true,
            disableListFilter: true,
            disableGroupBy: true,
            components: { Cell: '/components/PublicationCells#PublishedByCell' },
        },
        hooks: {
            beforeChange: [
                ({ data, originalDoc, operation, req }) => {
                    if ((data?._status ?? originalDoc?._status) === 'published') {
                        return req.user?.name || req.user?.email || null;
                    }
                    return operation === 'create' ? null : (originalDoc?.publishedBy ?? null);
                },
            ],
        },
    };
}
