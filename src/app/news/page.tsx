import Exhibitions from '@/components/Exhibitions';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function ExhibitionsPage() {
    return (
        <>
            <Header />
            <main className="max-w-[1400px] mx-auto">
                <Exhibitions />
            </main>
            <Footer />
        </>
    );
}
