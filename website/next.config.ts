import type { NextConfig } from 'next';

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_MEDIA_BASE_URL) {
    throw new Error('Set NEXT_PUBLIC_MEDIA_BASE_URL in .env before building; media is excluded from Firebase Hosting.');
}

const nextConfig: NextConfig = {
    output: 'export',
    images: { unoptimized: true },
};

export default nextConfig;
