'use client';

import { Banner, Button, Drawer, Pill, useDocumentInfo, useFormModified, useModal } from '@payloadcms/ui';
import { useEffect, useState } from 'react';
import type { DraftChange } from '../publish/draftDiff';
import type { DraftStatus } from '../publish/endpoints';
import { PublicationDate } from './PublicationCells';

const slug = 'studio-draft-changes';
/** How much unchanged text to keep on each side of an edit. */
const context = 80;
const notes = {
    added: { style: 'success', label: 'Added' },
    removed: { style: 'error', label: 'Removed' },
    moved: { style: 'light-gray', label: 'Rearranged' },
} as const;

const isWord = (character: string | undefined) => character !== undefined && !/\s/.test(character);

/** Splits two versions of a text into what they share at the start and end, and the words that differ in between. */
function split(before: string, after: string) {
    let start = 0;
    while (start < before.length && before[start] === after[start]) start += 1;
    // Step back to the start of the word the first difference falls in.
    while (start > 0 && isWord(before[start - 1]) && (isWord(before[start]) || isWord(after[start]))) start -= 1;
    let end = 0;
    const most = Math.min(before.length, after.length) - start;
    while (end < most && before[before.length - 1 - end] === after[after.length - 1 - end]) end += 1;
    // And forward to the end of the word the last difference falls in.
    while (end > 0 && isWord(before[before.length - end]) && (isWord(before[before.length - end - 1]) || isWord(after[after.length - end - 1]))) {
        end -= 1;
    }
    const lead = before.slice(0, start);
    const tail = before.slice(before.length - end);
    return {
        lead: lead.length > context ? `…${lead.slice(-context).replace(/^\S*\s/, '')}` : lead,
        was: before.slice(start, before.length - end),
        now: after.slice(start, after.length - end),
        tail: tail.length > context ? `${tail.slice(0, context).replace(/\s\S*$/, '')}…` : tail,
    };
}

function Value({ change, fresh }: { change: DraftChange; fresh: boolean }) {
    const before = change.before ?? '';
    const after = change.after ?? '';
    // Everything in a newly added row is new, so there is nothing to set it against.
    if (fresh) return <p>{after}</p>;
    const { lead, was, now, tail } = split(before, after);
    return (
        <dl>
            <dt>Published</dt>
            <dd>
                {before ? (
                    <>
                        {lead}
                        <del>{was}</del>
                        {tail}
                    </>
                ) : (
                    <em>Empty</em>
                )}
            </dd>
            <dt>Draft</dt>
            <dd>
                {after ? (
                    <>
                        {lead}
                        <ins>{now}</ins>
                        {tail}
                    </>
                ) : (
                    <em>Empty</em>
                )}
            </dd>
        </dl>
    );
}

function Changes({ changes, fresh = false }: { changes: DraftChange[]; fresh?: boolean }) {
    return (
        <ul>
            {changes.map((change, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: the list is fixed for one response, and labels can repeat.
                <li key={index}>
                    <div className="studio-draft__label">
                        {change.label}
                        {change.note && (
                            <Pill pillStyle={notes[change.note].style} size="small">
                                {notes[change.note].label}
                            </Pill>
                        )}
                    </div>
                    {change.changes ? (
                        <Changes changes={change.changes} fresh={fresh || change.note === 'added'} />
                    ) : (
                        !change.note && <Value change={change} fresh={fresh} />
                    )}
                </li>
            ))}
        </ul>
    );
}

/** A button in the document controls that opens the saved draft's changes beside the edit form. */
export function DraftChanges() {
    const { id, collectionSlug, globalSlug, hasPublishedDoc, unpublishedVersionCount } = useDocumentInfo();
    const { modalState, openModal } = useModal();
    const modified = useFormModified();
    const [status, setStatus] = useState<DraftStatus | null>(null);
    const [error, setError] = useState('');
    const open = Boolean(modalState[slug]?.isOpen);
    const query = collectionSlug ? `collection=${collectionSlug}&id=${id}` : `global=${globalSlug}`;

    // Loaded on every opening, so it follows each saved draft.
    useEffect(() => {
        if (!open) return;
        let current = true;
        setStatus(null);
        setError('');
        fetch(`/api/publish/draft?${query}`, { credentials: 'same-origin', cache: 'no-store' })
            .then(async (response) => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Could not load the draft changes.');
                if (current) setStatus(result);
            })
            .catch((error) => {
                if (current) setError(error instanceof Error ? error.message : 'Could not load the draft changes.');
            });
        return () => {
            current = false;
        };
    }, [open, query]);

    // Only a published page or document with a newer saved draft has something to compare.
    if (!hasPublishedDoc || unpublishedVersionCount < 1) return null;

    let body = <p>Loading…</p>;
    if (error) body = <p role="alert">{error}</p>;
    else if (status) body = status.changes.length > 0 ? <Changes changes={status.changes} /> : <p>The saved draft matches the published version.</p>;

    return (
        <>
            <Button buttonStyle="secondary" size="medium" onClick={() => openModal(slug)}>
                Draft changes
            </Button>
            <Drawer slug={slug} title="Draft changes" gutter={false} className="studio-draft-drawer">
                <div className="studio-draft">
                    <p className="studio-draft__meta">
                        The saved draft set against the published version, in the order of the form.
                        {status && (
                            <>
                                {' '}
                                Published <PublicationDate value={status.publishedAt} />
                                {status.publishedBy && ` by ${status.publishedBy}`}. Draft saved <PublicationDate value={status.savedAt} />.
                            </>
                        )}
                    </p>
                    {modified && <Banner type="info">You have unsaved edits. Save the draft to see them here.</Banner>}
                    {body}
                </div>
            </Drawer>
        </>
    );
}
