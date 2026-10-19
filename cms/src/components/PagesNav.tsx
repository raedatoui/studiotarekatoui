'use client';

import { Link, NavGroup, useConfig } from '@payloadcms/ui';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cmsPages } from '../globals/pages';

export function PagesNav() {
    const {
        config: {
            routes: { admin },
        },
    } = useConfig();
    const pathname = usePathname();
    const [slot, setSlot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const website = document.getElementById('nav-group-Website');
        if (!website) return;

        // Insert Pages before Website without changing the groups used by the dashboard.
        const target = document.createElement('div');
        website.before(target);
        setSlot(target);
        return () => target.remove();
    }, []);

    const links = [
        { href: `${admin}/pages`, label: 'All pages' },
        ...cmsPages.map((page) => ({ href: `${admin}${'path' in page ? page.path : `/globals/${page.slug}`}`, label: page.label })),
    ];

    const group = (
        <NavGroup label="Pages">
            {links.map(({ href, label }) => (
                <Link key={href} href={href} prefetch={false} className="nav__link" aria-current={pathname === href ? 'page' : undefined}>
                    {pathname === href && <div className="nav__link-indicator" />}
                    <span className="nav__link-label">{label}</span>
                </Link>
            ))}
        </NavGroup>
    );

    return slot ? createPortal(group, slot) : group;
}
