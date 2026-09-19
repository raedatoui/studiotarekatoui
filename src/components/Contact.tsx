import { siteContent } from '@/data/siteContent';

export default function Contact() {
    const { email, text } = siteContent.contact;

    return (
        <section className="py-[clamp(48px,6vw,80px)] px-[clamp(24px,4vw,64px)] max-w-[650px] mx-auto text-center">
            <div className="mb-[clamp(32px,4vw,56px)] border-b border-[var(--color-border)] pb-4">
                <span className="text-[clamp(20px,2vw,28px)] font-bold">Contact</span>
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
