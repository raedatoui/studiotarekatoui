'use client';

import { useField, useForm } from '@payloadcms/ui';
import { useId, useState } from 'react';
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE } from '../media/upload';

export function ImageUpload({ path }: { path: string }) {
    const { setValue, disabled, formProcessing } = useField<string>({ path });
    const { setProcessing } = useForm();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const id = useId();

    async function upload(file: File) {
        setError('');
        if (file.size > MAX_IMAGE_SIZE) {
            setError('Choose an image no larger than 20 MB.');
            return;
        }
        setBusy(true);
        setProcessing(true);
        try {
            const body = new FormData();
            body.append('file', file);
            const response = await fetch('/api/media/upload', { method: 'POST', credentials: 'same-origin', body });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Image upload failed.');
            setValue(result.url);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Image upload failed.');
        } finally {
            setBusy(false);
            setProcessing(false);
        }
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem' }}>Upload image</label>
            <input
                id={id}
                type="file"
                accept={IMAGE_ACCEPT}
                disabled={disabled || formProcessing || busy}
                aria-describedby={`${id}-help`}
                onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = '';
                    if (file) void upload(file);
                }}
            />
            <p id={`${id}-help`}>JPEG, PNG, WebP, or GIF, up to 20 MB. Uploading fills in the image URL; save the research entry to keep it.</p>
            {busy && <p role="status">Uploading image…</p>}
            {error && <p role="alert">{error}</p>}
        </div>
    );
}
