'use client';

import ImageSlider from '@/components/ImageSlider';
import { useSiteData } from '@/data/SiteDataProvider';
import { useEffect, useRef, useState } from 'react';

export default function PortfolioContent() {
    const { portfolio: portfolioWorks } = useSiteData();
    const [activeId, setActiveId] = useState<string>('');
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const header = document.querySelector('header');
        if (header) {
            document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        }
    }, []);

    useEffect(() => {
        const sections = portfolioWorks.map((w) => document.getElementById(w.id)).filter(Boolean) as HTMLElement[];
        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: '-20% 0px -60% 0px' }
        );

        for (const section of sections) observer.observe(section);
        return () => observer.disconnect();
    }, [portfolioWorks]);

    useEffect(() => {
        if (!activeId || !navRef.current) return;
        const activeLink = navRef.current.querySelector(`[data-id="${activeId}"]`) as HTMLElement | null;
        if (activeLink) {
            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeId]);

    return (
        <main className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)]">
            <div className="pt-[clamp(24px,3vw,40px)] pb-[clamp(12px,2vw,24px)]">
                <h1 className="text-[clamp(32px,4vw,48px)] font-light tracking-[0.04em]">Selected Works</h1>
            </div>

            <nav
                ref={navRef}
                className="sticky top-[var(--header-height,60px)] z-50 bg-[var(--color-bg)] border-b border-[var(--color-border)] py-3 -mx-[clamp(24px,4vw,64px)] px-[clamp(24px,4vw,64px)]"
            >
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {portfolioWorks.map((work) => (
                        <li key={work.id}>
                            <a
                                href={`#${work.id}`}
                                data-id={work.id}
                                className={`text-[13px] tracking-[0.02em] transition-colors duration-200 ${
                                    activeId === work.id
                                        ? 'text-[var(--color-text)] font-medium'
                                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                                }`}
                            >
                                {work.title}
                                <span className="ml-1 text-[11px] opacity-60">{work.year}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {portfolioWorks.map((work) => (
                <section
                    key={work.id}
                    id={work.id}
                    className="py-[clamp(48px,8vw,96px)] border-b border-[var(--color-border)] last:border-b-0 scroll-mt-[calc(var(--header-height,60px)+52px)]"
                >
                    <div className="max-w-[700px] mx-auto text-center mb-[clamp(32px,5vw,64px)]">
                        <h2 className="text-[clamp(24px,3vw,36px)] font-light italic tracking-[0.02em]">{work.title}</h2>
                        <p className="mt-2 text-[clamp(18px,2vw,24px)] font-light text-[var(--color-text-secondary)]">{work.year}</p>
                        <div className="mt-8 space-y-5">
                            {work.description.map((paragraph) => (
                                <p key={paragraph} className="text-[clamp(14px,1.1vw,16px)] font-light leading-[1.8] text-[var(--color-text)]">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    {work.images.length > 0 && <ImageSlider images={work.images} title={work.title} />}
                </section>
            ))}
        </main>
    );
}
