import type { Metadata } from 'next';
import { SiteDataProvider } from '@/data/SiteDataProvider';
import './globals.css';

export const metadata: Metadata = {
    title: 'Studio Tarek Atoui',
    description: 'Tarek Atoui \u2014 artist and electroacoustic composer. News and contact.',
};

const initScript = `
(function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: initScript }} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="min-h-screen overflow-x-hidden">
                <SiteDataProvider>{children}</SiteDataProvider>
            </body>
        </html>
    );
}
