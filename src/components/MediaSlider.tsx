'use client';

import { useCallback, useRef, useState } from 'react';
import type { GallerySlide } from '@/lib/media';
import { mediaUrl } from '@/lib/mediaUrl';

interface MediaSliderProps {
    items: GallerySlide[];
    title: string;
}

export default function MediaSlider({ items: media, title }: MediaSliderProps) {
    const items = [...media].sort((a, b) => Number(b.type === 'embed' || b.type === 'video') - Number(a.type === 'embed' || a.type === 'video'));
    const [current, setCurrent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStart = useRef(0);

    const total = items.length;
    const currentIsImage = !items[current]?.type || items[current].type === 'image';

    const go = useCallback(
        (dir: 1 | -1) => {
            if (total > 1) setCurrent((prev) => (prev + dir + total) % total);
        },
        [total]
    );

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!currentIsImage || (e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        dragStart.current = e.clientX;
        setDragOffset(0);
        e.currentTarget.setPointerCapture(e.pointerId);
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
        <figure
            className="select-none"
            aria-label={`${title} gallery`}
            onKeyDown={(event) => {
                if ((event.target as HTMLElement).closest('video, iframe')) return;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    go(event.key === 'ArrowLeft' ? -1 : 1);
                }
            }}
        >
            <div
                className={`relative overflow-hidden ${currentIsImage ? 'cursor-grab active:cursor-grabbing touch-pan-y' : ''}`}
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
                    {items.map((item, idx) => (
                        <div
                            key={item.src}
                            aria-hidden={idx !== current}
                            className="w-full flex-shrink-0 flex items-center justify-center max-h-[70vh]"
                        >
                            {!item.type || item.type === 'image' ? (
                                <img
                                    src={mediaUrl(item.src)}
                                    alt={`${title} — ${item.caption}`}
                                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain pointer-events-none"
                                    loading={idx === 0 ? 'eager' : 'lazy'}
                                    draggable={false}
                                />
                            ) : (
                                <div className="aspect-video min-h-[200px] max-h-[70vh] w-full bg-black">
                                    {idx === current &&
                                        (item.type === 'embed' ? (
                                            <iframe
                                                src={mediaUrl(item.src)}
                                                title={`${title} — ${item.caption}`}
                                                className="h-full w-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                allowFullScreen
                                            />
                                        ) : (
                                            // biome-ignore lint/a11y/useMediaCaption: Caption tracks are not available in the current video data.
                                            <video
                                                src={mediaUrl(item.src)}
                                                aria-label={item.caption}
                                                className="h-full w-full"
                                                controls
                                                playsInline
                                                preload="metadata"
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => go(-1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
                            aria-label="Previous slide"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => go(1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
                            aria-label="Next slide"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            <figcaption className="mt-3 text-[length:calc(11px*var(--copy-scale))] text-[var(--color-text-secondary)] font-light tracking-[0.02em] text-center">
                {items[current].caption}
            </figcaption>

            {total > 1 && (
                <>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {items.map((item, idx) => (
                            <button
                                key={item.src}
                                type="button"
                                onClick={() => setCurrent(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    idx === current ? 'bg-[var(--color-text)] w-3' : 'bg-[var(--color-text-secondary)] opacity-40 hover:opacity-70'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                                aria-current={idx === current ? 'true' : undefined}
                            />
                        ))}
                    </div>

                    <p className="text-center text-[length:calc(11px*var(--copy-scale))] text-[var(--color-text-secondary)] mt-2 font-light">
                        {current + 1} / {total}
                    </p>
                </>
            )}
        </figure>
    );
}
