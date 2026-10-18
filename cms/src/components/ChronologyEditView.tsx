'use client';

import { ConfigProvider, DefaultEditView, useConfig } from '@payloadcms/ui';
import { usePathname } from 'next/navigation';
import type { ClientConfig, DocumentViewClientProps } from 'payload';
import { useMemo } from 'react';

export function ChronologyEditView(props: DocumentViewClientProps) {
    const { config } = useConfig();
    const introduction = usePathname().endsWith('/introduction');
    const viewConfig = useMemo<ClientConfig>(
        () => ({
            ...config,
            globals: config.globals.map((global) => {
                if (global.slug !== 'chronology') return global;

                return {
                    ...global,
                    label: introduction ? 'Chronology page' : global.label,
                    // Preserve field positions and the full form state; only the visible editor changes.
                    fields: global.fields.map((field) => {
                        if (field.type === 'collapsible' && field.label === 'Page introduction') {
                            return { ...field, admin: { ...field.admin, hidden: !introduction } };
                        }
                        if (field.type === 'array' && field.name === 'projects') {
                            return {
                                ...field,
                                admin: {
                                    ...field.admin,
                                    initCollapsed: field.admin?.initCollapsed,
                                    isSortable: field.admin?.isSortable,
                                    hidden: introduction,
                                },
                            };
                        }
                        return field;
                    }),
                };
            }),
        }),
        [config, introduction]
    );

    return (
        <ConfigProvider config={viewConfig}>
            <DefaultEditView {...props} />
        </ConfigProvider>
    );
}
