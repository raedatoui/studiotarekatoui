'use client';

import { useRowLabel } from '@payloadcms/ui';

export function NewsExhibitionRowLabel() {
    const { data } = useRowLabel<{ title?: string; venue?: string }>();
    return <span>{data.title || data.venue || 'Untitled item'}</span>;
}
