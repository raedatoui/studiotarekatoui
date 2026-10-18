'use client';

import { useState } from 'react';

export function ExportContent() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function download() {
        setBusy(true);
        setError('');
        try {
            const response = await fetch('/api/content/export', { credentials: 'same-origin', cache: 'no-store' });
            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Content export failed.');
            }
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement('a');
            link.href = url;
            link.download = 'content.json';
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Content export failed.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={{ padding: '1rem 0' }}>
            <button type="button" className="btn btn--style-secondary btn--size-small" disabled={busy} onClick={download}>
                {busy ? 'Exporting…' : 'Export JSON'}
            </button>
            {error && (
                <p role="alert" style={{ whiteSpace: 'pre-wrap' }}>
                    {error}
                </p>
            )}
        </div>
    );
}
