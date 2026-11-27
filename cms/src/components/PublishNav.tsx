'use client';

import { Link, useConfig } from '@payloadcms/ui';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PublishNav() {
    const {
        config: {
            routes: { admin },
        },
    } = useConfig();
    const pathname = usePathname();
    const href = `${admin}/publish`;
    const [pending, setPending] = useState(false);

    // Checked again on every admin navigation, so the flag follows edits as they are published.
    // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the refresh signal.
    useEffect(() => {
        let current = true;
        fetch('/api/publish/status?flag=1', { credentials: 'same-origin', cache: 'no-store' })
            .then((response) => (response.ok ? response.json() : null))
            .then((result) => {
                if (current) setPending(Boolean(result?.pending));
            })
            .catch(() => {});
        return () => {
            current = false;
        };
    }, [pathname]);

    return (
        <Link id="nav-publish" href={href} prefetch={false} className="nav__link" aria-current={pathname === href ? 'page' : undefined}>
            {pathname === href && <div className="nav__link-indicator" />}
            <span className="nav__link-label">
                Publish website
                {pending && <strong> • changes not on staging</strong>}
            </span>
        </Link>
    );
}
