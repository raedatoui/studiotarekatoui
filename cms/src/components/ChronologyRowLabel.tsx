'use client';

import { useRowLabel } from '@payloadcms/ui';

export function ChronologyRowLabel() {
    const { data, rowNumber } = useRowLabel<{ title?: string; venue?: string; year?: number; kind?: string }>();
    return <span>{[data.year, data.title || data.venue, data.kind].filter(Boolean).join(' · ') || `Project ${(rowNumber ?? 0) + 1}`}</span>;
}
