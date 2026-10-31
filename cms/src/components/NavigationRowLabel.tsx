'use client';

import { useRowLabel } from '@payloadcms/ui';

export function NavigationRowLabel() {
    const { data } = useRowLabel<{ label?: string }>();
    return <span>{data.label || 'Untitled menu item'}</span>;
}
