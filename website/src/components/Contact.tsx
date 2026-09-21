'use client';

import { useSiteData } from '@/data/SiteDataProvider';

export default function Contact() {
    const { contact: { heading, email, text } } = useSiteData();

    return (
        <section className="py-[clamp(48px,6vw,80px)] px-[clamp(24px,4vw,64px)] max-w-[650px] mx-auto text-center">
            <div className="mb-[clamp(32px,4vw,56px)] border-b border-[var(--color-border)] pb-4">
                <h1 className="text-[clamp(20px,2vw,28px)] font-bold">{heading}</h1>
            </div>
            {text}&nbsp;
            <a
                href={`mailto:${email}`}
                className="text-[length:calc(clamp(14px,1.1vw,17px)*var(--copy-scale))] font-normal border-b border-transparent hover:border-[var(--color-text)] transition-[border-color] duration-200"
            >
                {email}
            </a>
        </section>
    );
}
