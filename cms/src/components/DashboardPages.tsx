'use client';

import { Card, Link, useAuth, useConfig } from '@payloadcms/ui';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cmsPages } from '../globals/pages';

export function DashboardPages() {
    const { permissions } = useAuth();
    const {
        config: {
            routes: { admin },
        },
    } = useConfig();
    const pages = cmsPages.filter(({ slug }) => permissions?.globals?.[slug]?.read);
    const hasPages = pages.length > 0;
    const [slot, setSlot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const dashboard = document.querySelector('.dashboard');
        if (!hasPages || !dashboard) return;

        const target = document.createElement('div');
        const placePages = () => {
            const wrap = dashboard.querySelector('.collections:not(.studio-dashboard-pages) > .collections__wrap');
            if (!wrap) {
                setSlot(null);
                return;
            }

            const website = wrap.querySelector('#card-navigation')?.closest('.collections__group') ?? null;
            if (target.parentElement !== wrap || target.nextElementSibling !== website) {
                wrap.insertBefore(target, website);
            }
            setSlot(target);
        };

        // Keep Pages before Website when Payload loads or rearranges dashboard widgets.
        placePages();
        const observer = new MutationObserver(placePages);
        observer.observe(dashboard, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            target.remove();
        };
    }, [hasPages]);

    if (!hasPages) return null;

    const group = (
        <section className="collections__group" aria-labelledby="studio-dashboard-pages-title">
            <div className="studio-dashboard-pages__heading">
                <h2 className="collections__label" id="studio-dashboard-pages-title">Pages</h2>
                <Link href={`${admin}/pages`} prefetch={false}>All pages</Link>
            </div>
            <ul className="collections__card-list">
                {pages.map((page) => (
                    <li key={page.slug}>
                        <Card
                            id={`card-page-${page.slug}`}
                            title={page.label}
                            titleAs="h3"
                            buttonAriaLabel={`Edit ${page.label} page`}
                            href={`${admin}${'path' in page ? page.path : `/globals/${page.slug}`}`}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );

    return slot ? createPortal(group, slot) : (
        <div className="collections studio-dashboard-pages">
            <div className="collections__wrap">{group}</div>
        </div>
    );
}
