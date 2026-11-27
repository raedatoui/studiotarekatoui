import { DefaultTemplate } from '@payloadcms/next/templates';
import { Gutter, SetStepNav } from '@payloadcms/ui';
import type { AdminViewServerProps } from 'payload';
import { PublishPanel } from './PublishPanel';

export function PublishView(props: AdminViewServerProps) {
    const {
        initPageResult: { req, permissions, visibleEntities },
    } = props;

    return (
        <DefaultTemplate {...props} req={req} permissions={permissions} visibleEntities={visibleEntities}>
            <SetStepNav nav={[{ label: 'Publish website' }]} />
            <Gutter>
                <h1>Publish website</h1>
                <PublishPanel />
            </Gutter>
        </DefaultTemplate>
    );
}
