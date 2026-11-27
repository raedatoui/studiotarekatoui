import { Link } from '@payloadcms/ui';
import type { PublishStatus } from '../publish/endpoints';

/** The saved drafts list, shared by the CMS home and the Publish website page. */
export function SavedDrafts({ admin, drafts }: { admin: string; drafts: PublishStatus['drafts'] }) {
    return (
        <ul>
            {drafts.map((draft) => (
                <li key={draft.href}>
                    <Link href={`${admin}${draft.href}`} prefetch={false}>
                        {draft.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
