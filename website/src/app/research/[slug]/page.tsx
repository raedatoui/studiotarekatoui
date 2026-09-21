import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ResearchThread from '@/components/ResearchThread';
import { getResearch, siteContent } from '@/data/siteContent';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
    return siteContent.research.map((research) => ({ slug: research.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    const research = getResearch(slug);
    if (!research) {
        return { title: 'Research — Studio Tarek Atoui' };
    }
    return {
        title: `${research.title} — Studio Tarek Atoui`,
        description: research.summary,
        alternates: { canonical: `/research/${research.slug}` },
    };
}

export default async function ResearchThreadPage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    const research = getResearch(slug);
    if (!research) {
        notFound();
    }
    return (
        <>
            <Header />
            <ResearchThread research={research} />
            <Footer />
        </>
    );
}
