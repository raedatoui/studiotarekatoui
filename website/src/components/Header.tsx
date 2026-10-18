'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { showChronology, showPublications, site } from '@/config/site';
import { useSiteData } from '@/data/SiteDataProvider';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const { navigation, chronology } = useSiteData();
    const pathname = usePathname().replace(/\/+$/, '') || '/';
    const currentPath = pathname === '/' ? '/news' : pathname;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const menu = menuRef.current;
        if (!menuOpen || !menu) return;

        const desktop = window.matchMedia('(min-width: 48rem)');
        if (desktop.matches) {
            setMenuOpen(false);
            return;
        }

        menu.showModal();
        const htmlOverflow = document.documentElement.style.overflow;
        const bodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        const closeOnDesktop = () => {
            if (desktop.matches) setMenuOpen(false);
        };
        desktop.addEventListener('change', closeOnDesktop);

        return () => {
            desktop.removeEventListener('change', closeOnDesktop);
            menu.close();
            document.documentElement.style.overflow = htmlOverflow;
            document.body.style.overflow = bodyOverflow;
        };
    }, [menuOpen]);

    const items = navigation.items.filter((link) => new URL(link.href, site.url).pathname.replace(/\/+$/, '') !== '/chronology');
    if (showChronology && chronology) items.push({ label: chronology.heading, href: '/chronology', external: false });
    const navLinks = items.map((item, index) => {
        const link =
            !showPublications && new URL(item.href, site.url).pathname.replace(/\/+$/, '') === '/publications'
                ? { ...item, href: 'https://www.crousel.com/artiste/tarek-atoui-r90lmw/#items', external: true }
                : item;
        const url = new URL(link.href, site.url);
        const path = url.pathname.replace(/\/+$/, '') || '/';
        const linkPath = path === '/' ? '/news' : path;
        const internal = url.origin === new URL(site.url).origin;
        const current = internal && currentPath === linkPath ? 'page' : internal && currentPath.startsWith(`${linkPath}/`) ? 'location' : undefined;
        const navigateLocally = internal && !link.external;
        const NavigationLink = navigateLocally ? Link : 'a';

        return (
            <NavigationLink
                key={`${index}-${link.href}`}
                href={navigateLocally ? `${url.pathname}${url.search}${url.hash}` : link.href}
                aria-current={current}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="site-nav-link text-[length:calc(13px*var(--copy-scale))] max-md:text-[length:calc(18px*var(--copy-scale))] font-normal tracking-[0.04em] transition-colors duration-200 motion-reduce:transition-none"
                onClick={() => setMenuOpen(false)}
            >
                {link.label}
                {!internal && <span aria-hidden="true"> ↗</span>}
                {!internal && <span className="sr-only"> (external link)</span>}
            </NavigationLink>
        );
    });

    return (
        <header className="site-header sticky top-0 z-100 bg-[var(--color-header-bg)] backdrop-blur-[12px] border-b border-[var(--color-border)] transition-[background-color] duration-300">
            <div className="flex justify-between items-center max-md:gap-4 px-[clamp(24px,4vw,64px)] py-5 max-w-[1400px] mx-auto">
                <div className="text-[clamp(20px,2vw,28px)] font-medium tracking-[0.08em] uppercase">
                    <Link href="/">{site.title}</Link>
                </div>

                <div className="flex items-center gap-6 max-md:order-first max-md:shrink-0 max-md:gap-3">
                    <button
                        type="button"
                        className="hidden max-md:block bg-none border-none cursor-pointer p-1 z-300"
                        aria-label="Open menu"
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        aria-haspopup="dialog"
                        onClick={() => setMenuOpen(true)}
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

                    <nav className="hidden gap-8 md:flex">{navLinks}</nav>
                    <ThemeToggle />
                </div>
            </div>

            <dialog
                ref={menuRef}
                id="mobile-menu"
                aria-label="Site navigation"
                onClose={() => setMenuOpen(false)}
                className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-[var(--color-bg)] p-0 text-[var(--color-text)] md:hidden"
            >
                <div className="flex min-h-full flex-col">
                    <div className="sticky top-0 flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-[clamp(24px,4vw,64px)] py-5">
                        <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="cursor-pointer p-1">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <path d="m6 6 12 12M18 6 6 18" />
                            </svg>
                        </button>
                        <span className="text-[clamp(20px,2vw,28px)] font-medium tracking-[0.08em] uppercase">{site.title}</span>
                    </div>
                    <nav className="flex flex-1 flex-col items-center justify-center gap-8 px-[clamp(24px,4vw,64px)] py-10">{navLinks}</nav>
                </div>
            </dialog>
        </header>
    );
}
