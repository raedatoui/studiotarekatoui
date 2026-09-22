import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Endpoint } from 'payload';
import sharp from 'sharp';
import { isAllowedEmail, serverURL } from '../auth/settings';
import { MAX_IMAGE_SIZE } from './upload';

const storage = new Storage();
const imageTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
};

export const uploadEndpoint: Endpoint = {
    path: '/media/upload',
    method: 'post',
    handler: async (req) => {
        if (!req.user || !isAllowedEmail(req.user.email)) {
            return Response.json({ error: 'Sign in with an allowed editor account.' }, { status: 403 });
        }
        const origin = req.headers.get('origin');
        if (origin && origin !== serverURL) {
            return Response.json({ error: 'Invalid upload origin.' }, { status: 403 });
        }
        if (Number(req.headers.get('content-length')) > MAX_IMAGE_SIZE + 1024 * 1024) {
            return Response.json({ error: 'Choose an image no larger than 20 MB.' }, { status: 413 });
        }

        let form: FormData | undefined;
        try {
            form = await req.formData?.();
        } catch {
            return Response.json({ error: 'Send the image as multipart form data.' }, { status: 400 });
        }
        const file = form?.get('file');
        if (!(file instanceof File) || !file.size) {
            return Response.json({ error: 'Choose an image to upload.' }, { status: 400 });
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return Response.json({ error: 'Choose an image no larger than 20 MB.' }, { status: 413 });
        }

        const data = Buffer.from(await file.arrayBuffer());
        let format: string | undefined;
        try {
            format = (await sharp(data).metadata()).format;
        } catch {
            return Response.json({ error: 'The file is not a readable image.' }, { status: 415 });
        }
        const contentType = format && imageTypes[format];
        if (!contentType) {
            return Response.json({ error: 'Choose a JPEG, PNG, WebP, or GIF image.' }, { status: 415 });
        }

        const basename = path.parse(file.name).name.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 100) || 'image';
        const objectName = `tarekatoui.com/${randomUUID()}-${basename}.${format}`;
        try {
            await storage.bucket('typedef').file(objectName).save(data, {
                resumable: false,
                preconditionOpts: { ifGenerationMatch: 0 },
                metadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
            });
            return Response.json(
                { url: `https://cdn.typedefinc.com/${objectName}` },
                { status: 201, headers: { 'Cache-Control': 'no-store' } }
            );
        } catch (error) {
            req.payload.logger.error({ err: error, msg: 'Research image upload failed' });
            return Response.json({ error: 'Image upload failed. Check the CMS storage access and try again.' }, { status: 500 });
        }
    },
};
