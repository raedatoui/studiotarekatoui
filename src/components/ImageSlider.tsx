'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageSliderProps {
    images: { src: string; caption: string }[];
    title: string;
}

export default function ImageSlider({ images, title }: ImageSliderProps) {
    const [current, setCurrent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStart = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const total = images.length;

    const go = useCallback(
        (dir: 1 | -1) => {
            setCurrent((prev) => (prev + dir + total) % total);
        },
        [total]
    );

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') go(-1);
            if (e.key === 'ArrowRight') go(1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [go]);

    const onPointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragStart.current = e.clientX;
        setDragOffset(0);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setDragOffset(e.clientX - dragStart.current);
    };

    const onPointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (Math.abs(dragOffset) > 50) {
            go(dragOffset < 0 ? 1 : -1);
        }
        setDragOffset(0);
    };

    if (total === 0) return null;

    return (
        <div className="select-none">
            <div
                ref={containerRef}
                className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <div
                    className="flex"
                    style={{
                        transform: `translateX(calc(-${current * 100}% + ${isDragging ? dragOffset : 0}px))`,
                        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                >
                    {images.map((image, idx) => (
                        <div key={image.src} className="w-full flex-shrink-0 flex items-center justify-center max-h-[70vh]">
                            <img
                                src={image.src}
                                alt={`${title} — ${image.caption}`}
                                className="max-w-full max-h-[70vh] w-auto h-auto object-contain pointer-events-none"
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => go(-1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
                            aria-label="Previous image"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => go(1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
                            aria-label="Next image"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            <figcaption className="mt-3 text-[11px] text-[var(--color-text-secondary)] font-light tracking-[0.02em] text-center">
                {images[current].caption}
            </figcaption>

            {total > 1 && (
                <>
                    <div className="flex justify-center gap-1.5 mt-3">
                        {images.map((image, idx) => (
                            <button
                                key={image.src}
                                type="button"
                                onClick={() => setCurrent(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    idx === current ? 'bg-[var(--color-text)] w-3' : 'bg-[var(--color-text-secondary)] opacity-40 hover:opacity-70'
                                }`}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <p className="text-center text-[11px] text-[var(--color-text-secondary)] mt-2 font-light">
                        {current + 1} / {total}
                    </p>
                </>
            )}
        </div>
    );
}
