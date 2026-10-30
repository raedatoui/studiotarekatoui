'use client';

import { GroupField, useFormFields } from '@payloadcms/ui';
import { NEWS_SECTIONS } from '@tarek/content';
import type { GroupFieldClient, RowFieldClientProps } from 'payload';
import { getFieldPaths } from 'payload/shared';

export function NewsSectionsField({
    field,
    indexPath = '',
    parentPath = '',
    parentSchemaPath = '',
    permissions,
    readOnly,
}: RowFieldClientProps) {
    const sectionOrder = useFormFields(([fields]) =>
        NEWS_SECTIONS.map((_, index) => fields[`sectionOrder.${index}.section`]?.value).join(',')
    );
    const order = [...sectionOrder.split(','), ...NEWS_SECTIONS];
    // Keep each section's original field paths and mounted state when its display position changes.
    const sections = field.fields
        .map((sectionField, index) => ({ field: sectionField as GroupFieldClient, index, section: NEWS_SECTIONS[index] }))
        .sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section));

    return (
        <>
            {sections.map(({ field: sectionField, index, section }) => (
                <GroupField
                    key={section}
                    field={sectionField}
                    {...getFieldPaths({ field: sectionField, index, parentIndexPath: indexPath, parentPath, parentSchemaPath })}
                    parentPath={parentPath}
                    parentSchemaPath={parentSchemaPath}
                    permissions={permissions}
                    readOnly={readOnly}
                />
            ))}
        </>
    );
}
