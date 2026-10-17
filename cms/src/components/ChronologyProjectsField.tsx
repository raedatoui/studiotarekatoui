'use client';

import { ArrayField, useFormFields, useFormSubmitted } from '@payloadcms/ui';
import { INSTANCE_KINDS } from '@tarek/content';
import type { ArrayFieldClientProps } from 'payload';
import { useId, useState } from 'react';

export function ChronologyProjectsField(props: ArrayFieldClientProps) {
    const { path, field } = props;
    const id = useId();
    const fields = useFormFields(([formFields]) => formFields);
    const submitted = useFormSubmitted();
    const [filters, setFilters] = useState({ search: '', year: '', kind: '', review: '' });
    const [filteredRowIDs, setFilteredRowIDs] = useState<Set<string>>(new Set());
    const rows = fields[path]?.rows ?? [];
    const query = filters.search.trim().toLowerCase();
    const filtering = Boolean(query || filters.year || filters.kind || filters.review);
    const invalidRows = new Set<number>();
    if (submitted) {
        for (const [fieldPath, state] of Object.entries(fields)) {
            if (fieldPath.startsWith(`${path}.`) && state.valid === false) {
                invalidRows.add(Number(fieldPath.slice(path.length + 1).split('.')[0]));
            }
        }
    }

    const projects = rows.map((row, index) => {
        const prefix = `${path}.${index}`;
        const year = fields[`${prefix}.year`]?.value;
        const searchText = ['projectId', 'title', 'venue', 'city', 'country', 'organization']
            .map((key) => fields[`${prefix}.${key}`]?.value ?? '').join(' ').toLowerCase();
        const needsReview = fields[`${prefix}.needsReview`]?.value === true;
        const matches = (!query || searchText.includes(query))
            && (!filters.year || String(year) === filters.year)
            && (!filters.kind || fields[`${prefix}.kind`]?.value === filters.kind)
            && (!filters.review || needsReview === (filters.review === 'needs-review'));
        return {
            index,
            year: typeof year === 'number' && Number.isFinite(year) ? year : undefined,
            visible: matches || invalidRows.has(index) || (filtering && !filteredRowIDs.has(row.id)),
        };
    });
    const years = [...new Set(projects.map((project) => project.year).filter((year) => year !== undefined))].sort((a, b) => b - a);
    const visibleProjects = projects.filter((project) => project.visible);
    const updateFilter = (key: keyof typeof filters, value: string) => {
        setFilteredRowIDs(new Set(rows.map((row) => row.id)));
        setFilters((current) => ({ ...current, [key]: value }));
    };

    // Keep every row mounted in Payload's form; filtering must never replace the saved array.
    const rowSelector = `[data-chronology="${id}"] > .array-field > .array-field__draggable-rows > `;
    let previousYear: string | undefined;
    const rowStyles = projects.map((project) => {
        const selector = `${rowSelector}[id="${path.replaceAll('.', '-')}-row-${project.index}"]`;
        if (!project.visible) return `${selector} { display: none; }`;
        const year = project.year === undefined ? 'Year not set' : String(project.year);
        if (year === previousYear) return '';
        previousYear = year;
        return `${selector}::before { content: "${year}"; display: block; margin: 1rem 0 0.75rem;
            padding-top: 1rem; border-top: 1px solid var(--theme-elevation-200); font-size: 1.25rem; font-weight: 600; }`;
    }).join('\n');

    return (
        <div className="studio-chronology" data-chronology={id}>
            <div className="studio-chronology__filters" role="group" aria-label="Filter chronology projects">
                <label className="studio-chronology__search" htmlFor={`${id}-search`}>
                    Search projects
                    <input
                        id={`${id}-search`} type="search" value={filters.search} placeholder="Title, venue, city, organization or ID"
                        onChange={(event) => updateFilter('search', event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }}
                    />
                </label>
                <label htmlFor={`${id}-year`}>
                    Year
                    <select id={`${id}-year`} value={filters.year} onChange={(event) => updateFilter('year', event.target.value)}>
                        <option value="">All years</option>
                        {years.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                </label>
                <label htmlFor={`${id}-kind`}>
                    Project type
                    <select id={`${id}-kind`} value={filters.kind} onChange={(event) => updateFilter('kind', event.target.value)}>
                        <option value="">All types</option>
                        {INSTANCE_KINDS.map((kind) => <option key={kind} value={kind}>{kind[0].toUpperCase() + kind.slice(1)}</option>)}
                    </select>
                </label>
                <label htmlFor={`${id}-review`}>
                    Editorial review
                    <select id={`${id}-review`} value={filters.review} onChange={(event) => updateFilter('review', event.target.value)}>
                        <option value="">All entries</option>
                        <option value="needs-review">Needs review</option>
                        <option value="not-flagged">Not flagged</option>
                    </select>
                </label>
                <button type="button" disabled={!filtering} onClick={() => setFilters({ search: '', year: '', kind: '', review: '' })}>
                    Clear filters
                </button>
            </div>
            <p className="studio-chronology__results" role="status">
                Showing {visibleProjects.length} of {projects.length} projects.
                {filtering && visibleProjects.length === 0 && ' No projects match these filters.'}
                {filtering && ' Clear filters to reorder projects. New entries and entries with errors stay visible.'}
            </p>
            <style>{rowStyles}</style>
            <ArrayField {...props} field={{ ...field, admin: { ...field.admin, isSortable: filtering ? false : field.admin?.isSortable } }} />
        </div>
    );
}
