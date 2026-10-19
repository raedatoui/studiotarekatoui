'use client';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

type FilterOption = { value: string; label: string };

export default function ChronologyFilter({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
}) {
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchRef = useRef({ text: '', time: 0 });
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

    useEffect(() => {
        if (!open) return;
        const dismiss = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('pointerdown', dismiss);
        return () => document.removeEventListener('pointerdown', dismiss);
    }, [open]);

    useEffect(() => {
        if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }, [open, activeIndex]);

    function choose(index: number) {
        onChange(options[index].value);
        setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        const index = open ? activeIndex : selectedIndex;
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (open && event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
            }
            setOpen(false);
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (open) choose(activeIndex);
            else {
                setActiveIndex(selectedIndex);
                setOpen(true);
            }
        } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            let nextIndex = index;
            if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = options.length - 1;
            else if (open) nextIndex += event.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex(Math.max(0, Math.min(options.length - 1, nextIndex)));
            setOpen(true);
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            const now = Date.now();
            const text = (now - searchRef.current.time < 500 ? searchRef.current.text : '') + event.key.toLowerCase();
            searchRef.current = { text, time: now };
            const query = [...text].every((character) => character === text[0]) ? text[0] : text;
            const start = query.length === 1 ? index + 1 : index;
            const match = options.findIndex((_, offset) => options[(start + offset) % options.length].label.toLowerCase().startsWith(query));
            if (match !== -1) setActiveIndex((start + match) % options.length);
            else if (!open) setActiveIndex(selectedIndex);
            setOpen(true);
        }
    }

    return (
        <div
            ref={rootRef}
            className="relative w-full sm:w-auto"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
        >
            <button
                type="button"
                role="combobox"
                aria-labelledby={`${id}-label ${id}-value`}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={`${id}-options`}
                aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
                className={`flex min-h-11 w-full min-w-48 cursor-pointer items-center gap-4 rounded-sm border bg-[var(--color-bg)] px-4 py-2.5 text-left transition-colors motion-reduce:transition-none hover:border-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] ${open ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
                onClick={() => {
                    setActiveIndex(selectedIndex);
                    searchRef.current = { text: '', time: 0 };
                    setOpen(!open);
                }}
                onKeyDown={handleKeyDown}
            >
                <span id={`${id}-label`} className="text-[var(--color-text-secondary)]">
                    {label}
                </span>
                <span id={`${id}-value`} className={`flex-1 ${value !== 'all' ? 'text-[var(--color-accent)]' : ''}`}>
                    {options[selectedIndex].label}
                </span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className={`shrink-0 text-[var(--color-accent)] transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                >
                    <path d="m4 6 4 4 4-4" />
                </svg>
            </button>
            {open && (
                <ul
                    ref={listRef}
                    id={`${id}-options`}
                    role="listbox"
                    aria-labelledby={`${id}-label`}
                    className="absolute top-full left-0 z-20 mt-2 max-h-[min(18rem,50dvh)] w-full overflow-y-auto overscroll-contain rounded-sm border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
                >
                    {options.map((option, index) => (
                        <li key={option.value} role="presentation">
                            <button
                                type="button"
                                id={`${id}-option-${index}`}
                                role="option"
                                aria-selected={option.value === value}
                                tabIndex={-1}
                                className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-xs px-3 py-2 text-left ${index === activeIndex ? 'bg-[var(--color-accent)]/10' : 'hover:bg-[var(--color-hover-bg)]'} ${option.value === value ? 'text-[var(--color-accent)]' : ''}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    choose(index);
                                    rootRef.current?.querySelector('button')?.focus({ preventScroll: true });
                                }}
                            >
                                {option.label}
                                {option.value === value && (
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                        <path d="m3 8 3 3 7-7" />
                                    </svg>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
