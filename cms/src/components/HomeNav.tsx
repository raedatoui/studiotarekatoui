'use client';

import { Link, useConfig } from '@payloadcms/ui';
import { usePathname } from 'next/navigation';

export function HomeNav() {
    const { config: { routes: { admin } } } = useConfig();
    const active = usePathname() === admin;

    return (
        <Link id="nav-home" href={admin} prefetch={false} className="nav__link studio-nav-home" aria-current={active ? 'page' : undefined}>
            {active && <div className="nav__link-indicator" />}
            <span className="nav__link-label">Home</span>
        </Link>
    );
}
