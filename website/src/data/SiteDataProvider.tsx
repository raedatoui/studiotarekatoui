'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { ContentSnapshot } from '@tarek/content';

const SiteDataContext = createContext<ContentSnapshot | null>(null);

export function SiteDataProvider({ children, content }: { children: ReactNode; content: ContentSnapshot }) {
    return <SiteDataContext.Provider value={content}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): ContentSnapshot {
    const value = useContext(SiteDataContext);
    if (!value) {
        throw new Error('useSiteData must be used within a SiteDataProvider');
    }
    return value;
}
