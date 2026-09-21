import Bio from '@/components/Bio';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import { siteContent } from '@/data/siteContent';

export const metadata: Metadata = {
    title: 'About — Studio Tarek Atoui',
    description: siteContent.about.text,
    alternates: { canonical: '/about' },
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto">
                <Bio />
            </main>
            <Footer />
        </>
    );
}
