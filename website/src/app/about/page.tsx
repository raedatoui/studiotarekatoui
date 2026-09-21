import Bio from '@/components/Bio';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

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
