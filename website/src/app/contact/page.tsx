import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

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
