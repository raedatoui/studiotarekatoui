import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Publications from '@/components/Publications';
import { showPublications } from '@/config/site';

export const metadata: Metadata = {
    title: 'Publications — Studio Tarek Atoui',
    description: 'Books, exhibition catalogues and records by Tarek Atoui.',
    robots: { index: false, follow: false },
};

export default function PublicationsPage() {
    if (!showPublications) notFound();
    return (
        <>
            <Header />
            <main className="max-w-[1200px] mx-auto">
                <Publications />
            </main>
            <Footer />
        </>
    );
}
