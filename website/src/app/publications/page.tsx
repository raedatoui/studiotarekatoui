import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Publications from '@/components/Publications';

export const metadata: Metadata = {
    title: 'Publications — Studio Tarek Atoui',
    description: 'Books, exhibition catalogues and records by Tarek Atoui.',
    alternates: { canonical: '/publications' },
};

export default function PublicationsPage() {
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
