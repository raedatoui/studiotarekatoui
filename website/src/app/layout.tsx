import type { Metadata } from 'next';
import { SiteDataProvider } from '@/data/SiteDataProvider';
import { siteContent } from '@/data/siteContent';
import { isStaging, site } from '@/config/site';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: site.title,
    description: 'Tarek Atoui — artist and electroacoustic composer. Research, biography and contact.',
    robots: isStaging ? { index: false, follow: false } : { index: true, follow: true },
    // Social titles and descriptions inherit each page's metadata.
    openGraph: {
        type: 'website',
        siteName: site.title,
        url: './',
        images: [{ url: '/apple-icon.png', width: 180, height: 180, alt: site.title, type: 'image/png' }],
    },
    twitter: {
        card: 'summary',
    },
};

const initScript = `
(function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

})();
`;

const analyticsScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-FGMV1SXH2X');
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script>{initScript}</script>
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-FGMV1SXH2X" />
                <script>{analyticsScript}</script>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen overflow-x-hidden">
                <SiteDataProvider content={siteContent}>{children}</SiteDataProvider>
            </body>
        </html>
    );
}
