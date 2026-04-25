export default function Contact() {
    return (
        <section className="py-[clamp(48px,6vw,80px)] px-[clamp(24px,4vw,64px)] max-w-[650px] mx-auto text-center">
            <div className="mb-[clamp(32px,4vw,56px)] border-b border-[var(--color-border)] pb-4">
                <span className="text-[clamp(20px,2vw,28px)] font-bold">Contact</span>
            </div>
            For any inquiries or collaborations, please don’t hesitate to reach out at&nbsp;
            <a
                href="mailto:studio@tarekatoui.com"
                className="text-[clamp(14px,1.1vw,17px)] font-normal border-b border-transparent hover:border-[var(--color-text)] transition-[border-color] duration-200"
            >studio@tarekatoui.com</a>

        </section>
    );
}
