'use client';

import { useRowLabel } from '@payloadcms/ui';
import { NEWS_SECTION_LABELS, type NEWS_SECTIONS } from '@tarek/content';

export function NewsSectionRowLabel() {
    const { data } = useRowLabel<{ section?: (typeof NEWS_SECTIONS)[number] }>();
    return <span>{data.section ? NEWS_SECTION_LABELS[data.section] : 'Section'}</span>;
}
