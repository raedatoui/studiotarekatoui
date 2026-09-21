'use client';

import { useState } from 'react';
import { useSiteData } from '@/data/SiteDataProvider';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const { meta, navigation } = useSiteData();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-100 bg-[var(--color-header-bg)] backdrop-blur-[12px] border-b border-[var(--color-border)] transition-[background-color] duration-300">
            <div className="flex justify-between items-center px-[clamp(24px,4vw,64px)] py-5 max-w-[1400px] mx-auto">
                <div className="text-[clamp(20px,2vw,28px)] font-medium tracking-[0.08em] uppercase">
                    <a href="/">{meta.siteTitle}</a>
                </div>

                <button
                    type="button"
                    className="hidden max-md:block bg-none border-none cursor-pointer p-1 z-300"
                    aria-label="Toggle menu"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <span
                        className={`block w-[22px] h-[1.5px] bg-[var(--color-text)] my-[5px] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-x-[5px] translate-y-[5px]' : ''}`}
                    />
                    <span
                        className={`block w-[22px] h-[1.5px] bg-[var(--color-text)] my-[5px] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
                    />
                    <span
                        className={`block w-[22px] h-[1.5px] bg-[var(--color-text)] my-[5px] transition-all duration-300 ${menuOpen ? '-rotate-45 translate-x-[5px] -translate-y-[5px]' : ''}`}
                    />
                </button>

                <div className="flex items-center gap-6">
                    <nav
                        className={`flex gap-8 max-md:fixed max-md:top-0 max-md:w-full max-md:h-screen max-md:bg-[var(--color-bg)] max-md:flex-col max-md:justify-center max-md:items-center max-md:gap-8 max-md:z-200 max-md:transition-[right] max-md:duration-300 ${menuOpen ? 'max-md:right-0' : 'max-md:-right-full'}`}
                    >
                        {navigation.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className="text-[13px] max-md:text-[18px] font-normal tracking-[0.04em] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
