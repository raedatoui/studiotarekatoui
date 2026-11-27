import { Link } from '@payloadcms/ui';
import type { ServerProps } from 'payload';
import { findDrafts } from '../publish/endpoints';
import { SavedDrafts } from './SavedDrafts';

export async function DashboardDrafts({ payload }: ServerProps) {
    const admin = payload.config.routes.admin;
    const drafts = await findDrafts(payload);

    return (
        <div className="studio-home">
            {drafts.length > 0 && (
                <section className="studio-home__drafts" aria-labelledby="studio-home-drafts-title">
                    <h2 id="studio-home-drafts-title">Saved drafts</h2>
                    <p>
                        Edits saved in the CMS and not published yet. The website leaves drafts out. Open one to review it. Where a published version
                        exists, <strong>Draft changes</strong> shows what differs.
                    </p>
                    <SavedDrafts admin={admin} drafts={drafts} />
                </section>
            )}
            <p>
                <Link href={`${admin}/guide`} prefetch={false}>
                    Managing content and pages
                </Link>{' '}
                explains where each part of the website is edited and how publishing works.
            </p>
        </div>
    );
}
