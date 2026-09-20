import { siteContent } from '@/data/siteContent';

export default function Footer() {
    return (
        <footer className="border-t border-[var(--color-border)] mt-[clamp(48px,6vw,80px)]">
            <div className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] py-6 text-center">
                <p className="text-[length:calc(0.75rem*var(--copy-scale))] text-[var(--color-text-secondary)] font-light tracking-[0.02em]">
                    &copy; {siteContent.meta.copyright}
                </p>
            </div>
        </footer>
    );
}
