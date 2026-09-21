import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProjectsHub from '@/components/ProjectsHub';
import { siteContent } from '@/data/siteContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Studio Tarek Atoui',
    description: siteContent.researchPage.introduction,
    alternates: { canonical: '/' },
};

export default function Home() {
    return (
        <>
            <Header />
            <ProjectsHub />
            <Footer />
        </>
    );
}
