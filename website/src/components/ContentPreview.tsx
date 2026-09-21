'use client';

import { useEffect, useState } from 'react';
import { previewAbout, previewContact, previewNavigation, previewNews, previewResearch, previewResearchPage } from '@tarek/content/preview';
import type { Research } from '@tarek/content';
import { SiteDataProvider, useSiteData } from '@/data/SiteDataProvider';
import Bio from './Bio';
import Contact from './Contact';
import ProjectsHub from './ProjectsHub';
import ResearchThread from './ResearchThread';
import Header from './Header';
import News from './News';

export type PreviewKind = 'research' | 'research-page' | 'about' | 'contact' | 'navigation' | 'news';
const cmsOrigin = process.env.NEXT_PUBLIC_CMS_ORIGIN || 'http://localhost:3001';

export default function ContentPreview({ kind }: { kind: PreviewKind }) {
    const baseline = useSiteData();
    const [content, setContent] = useState(baseline);
    const [research, setResearch] = useState<Research | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const source = window.parent !== window ? window.parent : window.opener;
        if (!source) return;
        function receive(event: MessageEvent) {
            if (event.origin !== cmsOrigin || event.source !== source || event.data?.type !== 'payload-live-preview') return;
            const message = event.data;
            if ((kind === 'research' ? message.collectionSlug : message.globalSlug) !== kind) return;
            if (!message.data || typeof message.data !== 'object' || Array.isArray(message.data)) return;
            if (kind === 'research') {
                const doc = previewResearch(message.data);
                setResearch(doc);
                const others = baseline.research.filter((item) => item.id !== doc.id);
                setContent({ ...baseline, research: [...others, doc].sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug, 'en')) });
            } else if (kind === 'research-page') {
                setContent({ ...baseline, researchPage: previewResearchPage(message.data) });
            } else if (kind === 'about') {
                setContent({ ...baseline, about: previewAbout(message.data) });
            } else if (kind === 'navigation') {
                setContent({ ...baseline, navigation: previewNavigation(message.data) });
            } else if (kind === 'news') {
                setContent({ ...baseline, news: previewNews(message.data) });
            } else {
                setContent({ ...baseline, contact: previewContact(message.data) });
            }
            setReady(true);
        }
        window.addEventListener('message', receive);
        source.postMessage({ type: 'payload-live-preview', ready: true }, cmsOrigin);
        return () => window.removeEventListener('message', receive);
    }, [baseline, kind]);

    if (!ready) return <p className="p-8 text-center">Open Live Preview in the CMS to view your changes.</p>;
    return (
        <SiteDataProvider content={content}>
            <div onClickCapture={(event) => {
                // Keep the editor in the preview, including when a new document has no public route.
                if ((event.target as HTMLElement).closest('a')) event.preventDefault();
            }}>
                {kind === 'navigation' && <Header />}
                {kind === 'research' && research && <ResearchThread research={research} />}
                {(kind === 'research-page' || kind === 'navigation') && <ProjectsHub />}
                {kind === 'about' && <Bio />}
                {kind === 'contact' && <Contact />}
                {kind === 'news' && <News />}
            </div>
        </SiteDataProvider>
    );
}
