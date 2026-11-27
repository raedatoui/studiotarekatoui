'use client';

import { Banner, Button, Link, Pill, useConfig } from '@payloadcms/ui';
import { useCallback, useEffect, useState } from 'react';
import type { BuildSummary } from '../publish/cloudBuild';
import type { PublishStatus } from '../publish/endpoints';
import { PublicationDate } from './PublicationCells';
import { SavedDrafts } from './SavedDrafts';

type StepState = { style: 'error' | 'light-gray' | 'success' | 'warning'; label: string };

const siteLabels = { staging: 'Staging', prod: 'Production' };
const changeLabels = { added: 'Added', removed: 'Removed', moved: 'Order changed' };

function resultLabel(build: BuildSummary) {
    if (build.active) return 'In progress';
    if (build.status === 'SUCCESS') return 'Published';
    return build.failure ? `Failed: ${build.failure}` : 'Failed';
}

function LastPublished({ build }: { build: BuildSummary }) {
    return (
        <>
            Last published <PublicationDate value={build.createdAt} /> by {build.requestedBy || 'the command line'}.
        </>
    );
}

export function PublishPanel() {
    const {
        config: {
            routes: { admin },
        },
    } = useConfig();
    const [status, setStatus] = useState<PublishStatus | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const response = await fetch('/api/publish/status', { credentials: 'same-origin', cache: 'no-store' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Could not load the publishing status.');
            setStatus(result);
            setError('');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Could not load the publishing status.');
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Follow a running build until it finishes.
    const running = status?.builds.find((build) => build.active);
    const runningId = running?.id;
    useEffect(() => {
        if (!runningId) return;
        const timer = setInterval(load, 5000);
        return () => clearInterval(timer);
    }, [runningId, load]);

    async function publish(site: 'staging' | 'production', question: string) {
        if (!window.confirm(question)) return;
        setBusy(true);
        setError('');
        try {
            const response = await fetch(`/api/publish/${site}`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stagingBuildId: status?.staged?.id }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Publishing failed.');
            await load();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Publishing failed.');
        } finally {
            setBusy(false);
        }
    }

    if (!status) {
        return (
            <div className="studio-publish">
                <p role={error ? 'alert' : undefined}>{error || 'Loading…'}</p>
            </div>
        );
    }

    const { staged, live, changes, drafts } = status;
    const changeCount = changes.reduce((total, group) => total + Math.max(group.changes.length, 1), 0);
    const changesLabel = `${changeCount} ${changeCount === 1 ? 'change' : 'changes'}`;
    const blocked = busy || Boolean(running);
    // With nothing new to send, a staging publish only rebuilds the same content.
    const rebuildOnly = !status.pending;

    let staging: StepState = { style: 'success', label: 'Up to date' };
    let stagingNote = 'Nothing to publish. Staging already shows everything that is published in the CMS.';
    let stagingQuestion = 'Rebuild the staging site from the current published content?';
    if (status.exportError) {
        staging = { style: 'error', label: 'Cannot publish' };
        stagingNote = status.exportError;
    } else if (!staged) {
        staging = { style: 'warning', label: 'Not published yet' };
        stagingNote = 'Nothing has been published to staging yet. The first publish sends everything that is published in the CMS.';
        stagingQuestion = 'Publish everything that is published in the CMS to the staging site?';
    } else if (changes.length > 0) {
        staging = { style: 'warning', label: `${changesLabel} waiting` };
        stagingNote = `${changesLabel} published in the CMS since staging was last published. Review them, then publish to staging.`;
        stagingQuestion = `Publish ${changesLabel} to the staging site?`;
    }

    let production: StepState = { style: 'warning', label: 'Ready to publish' };
    let productionNote = 'Review the staging site, then publish the same content to the public website.';
    if (status.pending) {
        production = { style: 'light-gray', label: 'Waiting for staging' };
        productionNote = 'Publish to staging first. The public website only ever receives what was reviewed on staging.';
    } else if (status.productionCurrent) {
        production = { style: 'success', label: 'Up to date' };
        productionNote = 'The public website already shows what is on staging.';
    }

    return (
        <div className="studio-publish">
            {error && (
                <div role="alert">
                    <Banner type="error">{error}</Banner>
                </div>
            )}
            {running && (
                <Banner type="info">
                    <strong>Publishing to {siteLabels[running.target].toLowerCase()}…</strong> Started{' '}
                    <PublicationDate value={running.createdAt} /> by {running.requestedBy || 'the command line'}. This usually takes two to three
                    minutes.
                </Banner>
            )}

            <section className="studio-publish__step">
                <div className="studio-publish__header">
                    <h2>1. Staging</h2>
                    <Pill pillStyle={staging.style} size="small">
                        {staging.label}
                    </Pill>
                </div>
                <p role={status.exportError ? 'alert' : undefined} style={{ whiteSpace: 'pre-wrap' }}>
                    {stagingNote}
                </p>
                {staged && (
                    <p className="studio-publish__meta">
                        <LastPublished build={staged} />
                        {status.stagingUrl && (
                            <>
                                {' '}
                                <a href={status.stagingUrl} target="_blank" rel="noreferrer">
                                    Open staging
                                </a>
                            </>
                        )}
                    </p>
                )}
                {changes.length > 0 && (
                    <ul className="studio-publish__changes">
                        {changes.map((group) => (
                            <li key={group.href || group.label}>
                                <h3>
                                    <Link href={`${admin}${group.href}`} prefetch={false}>
                                        {group.label}
                                    </Link>
                                    {group.kind !== 'changed' && ` — ${changeLabels[group.kind]}`}
                                </h3>
                                {group.publishedAt && (
                                    <p className="studio-publish__meta">
                                        Published in the CMS <PublicationDate value={group.publishedAt} />
                                        {group.publishedBy ? ` by ${group.publishedBy}` : ' (publisher not recorded)'}
                                    </p>
                                )}
                                {group.changes.length > 0 && (
                                    <ul>
                                        {group.changes.map((change) => (
                                            <li key={`${change.kind}:${change.path}:${change.before}:${change.after}`}>
                                                {change.path && <strong>{change.path}: </strong>}
                                                {change.kind === 'changed' ? (
                                                    <>
                                                        <del>{change.before || '(empty)'}</del> → <ins>{change.after || '(empty)'}</ins>
                                                    </>
                                                ) : (
                                                    <>
                                                        {changeLabels[change.kind]}
                                                        {(change.after || change.before) && `: ${change.after || change.before}`}
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="studio-publish__actions">
                    <Button
                        buttonStyle={rebuildOnly ? 'secondary' : 'primary'}
                        size="medium"
                        margin={false}
                        disabled={blocked || Boolean(status.exportError)}
                        onClick={() => publish('staging', stagingQuestion)}
                    >
                        {rebuildOnly ? 'Rebuild staging' : 'Publish to staging'}
                    </Button>
                    {rebuildOnly && <span className="studio-publish__meta">Only needed after the website code has been updated.</span>}
                </div>
            </section>

            <section className="studio-publish__step">
                <div className="studio-publish__header">
                    <h2>2. Production</h2>
                    <Pill pillStyle={production.style} size="small">
                        {production.label}
                    </Pill>
                </div>
                <p>{productionNote}</p>
                <p className="studio-publish__meta">{live ? <LastPublished build={live} /> : 'Not published from this page yet.'}</p>
                <div className="studio-publish__actions">
                    <Button
                        buttonStyle="primary"
                        size="medium"
                        margin={false}
                        disabled={status.pending || status.productionCurrent || blocked}
                        onClick={() => publish('production', 'Publish what is on staging to the public website?')}
                    >
                        Publish to production
                    </Button>
                </div>
            </section>

            {drafts.length > 0 && (
                <section className="studio-publish__section">
                    <h2>Saved drafts</h2>
                    <p>
                        These are not changes waiting to be published. They have edits saved as drafts in the CMS, and the website leaves drafts out.
                        Publish one in the CMS and it will appear above as a change.
                    </p>
                    <SavedDrafts admin={admin} drafts={drafts} />
                </section>
            )}

            <section className="studio-publish__section">
                <h2>Recent publishes</h2>
                {status.builds.length === 0 ? (
                    <p>Nothing has been published yet.</p>
                ) : (
                    <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Site</th>
                                    <th>Started</th>
                                    <th>By</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {status.builds.map((build) => (
                                    <tr key={build.id}>
                                        <td>{siteLabels[build.target]}</td>
                                        <td>
                                            <PublicationDate value={build.createdAt} />
                                        </td>
                                        <td>{build.requestedBy || 'Command line'}</td>
                                        <td>{resultLabel(build)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
