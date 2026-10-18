'use client';

import { Link, NavGroup, useConfig } from '@payloadcms/ui';
import { usePathname } from 'next/navigation';
import { cmsPages } from '../globals/pages';

export function PagesNav() {
    const {
        config: {
            routes: { admin },
        },
    } = useConfig();
    const pathname = usePathname();
    const links = [
        { href: `${admin}/pages`, label: 'All pages' },
        ...cmsPages.map(({ slug, label }) => ({ href: `${admin}/globals/${slug}`, label })),
    ];

    return (
        <NavGroup label="Pages">
            {links.map(({ href, label }) => (
                <Link key={href} href={href} prefetch={false} className="nav__link" aria-current={pathname === href ? 'page' : undefined}>
                    {pathname === href && <div className="nav__link-indicator" />}
                    <span className="nav__link-label">{label}</span>
                </Link>
            ))}
        </NavGroup>
    );
}
