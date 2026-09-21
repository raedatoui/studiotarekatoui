import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProjectsHub from '@/components/ProjectsHub';
import { siteContent } from '@/data/siteContent';

export const metadata: Metadata = {
    title: 'Research — Studio Tarek Atoui',
    description: siteContent.researchPage.introduction,
    alternates: { canonical: '/research' },
};

export default function ProjectsPage() {
    return (
        <>
            <Header />
            <ProjectsHub />
            <Footer />
        </>
    );
}
