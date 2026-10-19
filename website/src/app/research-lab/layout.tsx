import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { showResearchLab } from '@/config/site';

export const metadata: Metadata = {
    title: 'Research timeline previews — Studio Tarek Atoui',
    robots: { index: false, follow: false },
};

export default function ResearchLabLayout({ children }: { children: ReactNode }) {
    if (!showResearchLab) notFound();

    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
