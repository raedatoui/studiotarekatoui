import type { Endpoint } from 'payload';
import { isAllowedEmail } from '../auth/settings';
import { ContentExportError, exportContent } from './export';

export const exportEndpoint: Endpoint = {
    path: '/content/export',
    method: 'get',
    handler: async (req) => {
        if (!req.user || !isAllowedEmail(req.user.email)) return Response.json({ error: 'Sign in with an allowed editor account.' }, { status: 403 });
        try {
            const snapshot = await exportContent(req.payload);
            return new Response(`${JSON.stringify(snapshot, null, 2)}\n`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="content-${snapshot.exportedAt.slice(0, 10)}.json"`,
                    'Cache-Control': 'private, no-store',
                },
            });
        } catch (error) {
            return Response.json(
                { error: error instanceof ContentExportError ? error.message : 'Content export failed. Check the CMS connection and try again.' },
                { status: error instanceof ContentExportError ? 422 : 500, headers: { 'Cache-Control': 'no-store' } }
            );
        }
    },
};
