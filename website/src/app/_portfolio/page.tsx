import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PortfolioContent from '@/components/PortfolioContent';

// Parked in a private folder to exclude this page from routing and static exports.
export const metadata: Metadata = {
    title: 'Portfolio \u2014 Studio Tarek Atoui',
    description: 'Selected works by Tarek Atoui \u2014 artist and electroacoustic composer.',
};

export default function PortfolioPage() {
    return (
        <>
            <Header />
            <PortfolioContent />
            <Footer />
        </>
    );
}
