import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Chronology from '@/components/Chronology';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { showChronology } from '@/config/site';
import { siteContent } from '@/data/siteContent';

export const metadata: Metadata = {
    title: 'Chronology — Studio Tarek Atoui',
    robots: { index: false, follow: false },
};

export default function ChronologyPage() {
    if (!showChronology || !siteContent.chronology) notFound();
    return (
        <>
            <Header />
            <Chronology content={siteContent.chronology} research={siteContent.research} />
            <Footer />
        </>
    );
}
