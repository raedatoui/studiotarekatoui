import { site } from '@/config/site';

export default function Footer() {
    return (
        <footer className="border-t border-[var(--color-border)] mt-[clamp(48px,6vw,80px)] max-sm:mt-6">
            <div className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] py-6 flex items-center justify-center gap-3 text-center">
                <p className="text-[length:calc(0.75rem*var(--copy-scale))] text-[var(--color-text-secondary)] font-light tracking-[0.02em]">
                    &copy; {site.copyright}
                </p>
                <a
                    href="https://www.instagram.com/studiotarekatoui"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Studio Tarek Atoui on Instagram (opens in a new tab)"
                    className="inline-flex size-11 shrink-0 items-center justify-center text-[var(--color-text-secondary)] hover:opacity-70 transition-opacity"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                </a>
            </div>
        </footer>
    );
}
