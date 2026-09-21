import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import { siteContent } from '@/data/siteContent';

export const metadata: Metadata = {
    title: `${siteContent.contact.heading} — Studio Tarek Atoui`,
    description: siteContent.contact.text,
    alternates: { canonical: '/contact' },
};

export default function ContactPage() {
    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto">
                <Contact />
            </main>
            <Footer />
        </>
    );
}
