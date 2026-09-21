import Footer from '@/components/Footer';
import Header from '@/components/Header';
import News from '@/components/News';

export default function NewsPage() {
    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto">
                <News />
            </main>
            <Footer />
        </>
    );
}
