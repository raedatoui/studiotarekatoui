import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ResearchThread from '@/components/ResearchThread';
import { getTheme, themes } from '@/data/projects';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
    return themes.map((theme) => ({ slug: theme.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    const theme = getTheme(slug);
    if (!theme) {
        return { title: 'Research — Studio Tarek Atoui' };
    }
    return {
        title: `${theme.title} — Studio Tarek Atoui`,
        description: theme.summary,
    };
}

export default async function ResearchThreadPage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    if (!getTheme(slug)) {
        notFound();
    }
    return (
        <>
            <Header />
            <ResearchThread themeId={slug} />
            <Footer />
        </>
    );
}
