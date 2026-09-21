'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { SiteContent } from './schema';
import { siteContent } from './siteContent';

const SiteDataContext = createContext<SiteContent | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
    return <SiteDataContext.Provider value={siteContent}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteContent {
    const value = useContext(SiteDataContext);
    if (!value) {
        throw new Error('useSiteData must be used within a SiteDataProvider');
    }
    return value;
}
