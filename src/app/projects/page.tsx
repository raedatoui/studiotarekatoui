import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ProjectsHub from '@/components/ProjectsHub';

export const metadata: Metadata = {
    title: 'Projects — Studio Tarek Atoui',
    description: 'The long-term research threads of Tarek Atoui — ongoing inquiries into sound, material and listening, traced across time and place.',
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
