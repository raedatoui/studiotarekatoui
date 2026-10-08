'use client';

import { useConfig, useTranslation } from '@payloadcms/ui';
import { formatDate } from '@payloadcms/ui/shared';

export function PublishedByCell({ cellData, rowData }: {
    cellData?: string | null;
    rowData?: { lastPublishedAt?: string | null };
}) {
    return <span>{cellData || (rowData?.lastPublishedAt ? 'Not recorded' : '—')}</span>;
}

export function UpdatedByCell({ cellData }: { cellData?: string | null }) {
    return <span>{cellData || 'Not recorded'}</span>;
}

export function PublicationDate({ value }: { value?: string | null }) {
    const { config: { admin: { dateFormat } } } = useConfig();
    const { i18n } = useTranslation();
    return value ? <time dateTime={value}>{formatDate({ date: value, i18n, pattern: dateFormat })}</time> : <span>Never published</span>;
}
