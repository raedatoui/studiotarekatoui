import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPreview, { type PreviewKind } from '@/components/ContentPreview';

const kinds: PreviewKind[] = ['research', 'research-page', 'about', 'contact', 'navigation'];
export const dynamicParams = false;
export const metadata: Metadata = {
    title: 'CMS preview — Studio Tarek Atoui',
    robots: { index: false, follow: false },
};

export function generateStaticParams() {
    return kinds.map((kind) => ({ kind }));
}

export default async function PreviewPage({ params }: { params: Promise<{ kind: string }> }) {
    const { kind } = await params;
    const previewKind = kinds.find((value) => value === kind);
    if (!previewKind) notFound();
    return <ContentPreview kind={previewKind} />;
}
