'use client';

import { Button, useAuth, useConfig } from '@payloadcms/ui';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function ChronologyCreateButton() {
    const { permissions } = useAuth();
    const { config: { routes: { admin } } } = useConfig();
    const canUpdate = permissions?.globals?.chronology?.update;
    const [card, setCard] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const dashboard = document.querySelector('.dashboard');
        if (!canUpdate || !dashboard) return;

        const findCard = () => {
            const target = document.getElementById('card-chronology');
            setCard(target?.querySelector('.collections__locked') ? null : target);
        };
        findCard();
        // Dashboard widgets can arrive after this component or be rearranged by the editor.
        const observer = new MutationObserver(findCard);
        observer.observe(dashboard, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [canUpdate]);

    if (!canUpdate || !card) return null;

    return createPortal(
        <div className="card__actions">
            <Button
                aria-label="Add a chronology project"
                buttonStyle="icon-label"
                el="link"
                icon="plus"
                iconStyle="with-border"
                round
                to={`${admin}/globals/chronology?addProject=1`}
            />
        </div>,
        card
    );
}
