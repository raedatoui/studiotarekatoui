import type { Metadata } from 'next';
import Chronology from '@/components/Chronology';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export const metadata: Metadata = {
    title: 'Chronology — Studio Tarek Atoui',
    description:
        'Every project by Tarek Atoui in chronological order — exhibitions, performances, commissions, curations and residencies, filterable by year and kind.',
};

export default function ChronologyPage() {
    return (
        <>
            <Header />
            <Chronology />
            <Footer />
        </>
    );
}
