import Footer from '@/components/Footer';
import Header from '@/components/Header';
import News from '@/components/News';
import type { Metadata } from 'next';
import { siteContent } from '@/data/siteContent';

export const metadata: Metadata = {
    title: 'News — Studio Tarek Atoui',
    description: `${siteContent.news.soloHeading} and ${siteContent.news.groupHeading.toLowerCase()} by Tarek Atoui.`,
    alternates: { canonical: '/news' },
};

export default function NewsPage() {
    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto">
                <News />
            </main>
            <Footer />
        </>
    );
}
