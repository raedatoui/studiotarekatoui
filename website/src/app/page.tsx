import Footer from '@/components/Footer';
import Header from '@/components/Header';
import News from '@/components/News';
import { siteContent } from '@/data/siteContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Studio Tarek Atoui',
    description: `${siteContent.news.soloHeading} and ${siteContent.news.groupHeading.toLowerCase()} by Tarek Atoui.`,
    alternates: { canonical: '/' },
};

export default function Home() {
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
