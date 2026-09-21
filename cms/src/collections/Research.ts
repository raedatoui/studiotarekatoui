import type { CollectionConfig } from 'payload'
import { contentAccess } from '../access'
import { INSTANCE_KINDS, INSTANCE_STATUSES, PRESS_TYPES } from '@tarek/content'

export const Research: CollectionConfig = {
  slug: 'research',
  labels: { singular: 'Research theme', plural: 'Research themes' },
  admin: { useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'slug', 'ongoing', '_status'] },
  access: contentAccess,
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'subtitle', type: 'text' },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'description', type: 'array', label: 'Description paragraphs',
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'yearStart', type: 'number', required: true },
    { name: 'yearEnd', type: 'number' },
    { name: 'ongoing', type: 'checkbox', defaultValue: true },
    { name: 'yearsDisplay', type: 'text', label: 'Display dates' },
    { name: 'heroImageURL', type: 'text', label: 'Cover image URL' },
    {
      name: 'coverPreview', type: 'ui',
      admin: {
        components: {
          Field: {
            path: '/components/MediaPreview#MediaPreview',
            clientProps: { urlField: 'heroImageURL', labelField: 'title' },
          },
        },
      },
    },
    { name: 'collaborators', type: 'text', hasMany: true },
    { name: 'organizations', type: 'text', hasMany: true },
    { name: 'materials', type: 'text', hasMany: true },
    {
      name: 'instances', type: 'array',
      labels: { singular: 'Instance', plural: 'Instances' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '/components/ResearchRowLabels#InstanceRowLabel' },
      },
      fields: [
        { name: 'slug', type: 'text', admin: { hidden: true } },
        { name: 'title', type: 'text' },
        {
          name: 'kind', type: 'select', required: true,
          options: [...INSTANCE_KINDS],
        },
        { name: 'year', type: 'number', required: true },
        { name: 'organization', type: 'text', required: true },
        {
          type: 'row', fields: [
            { name: 'city', type: 'text', admin: { width: '50%' } },
            { name: 'country', type: 'text', admin: { width: '50%' } },
          ],
        },
        { name: 'dateStart', type: 'date' },
        { name: 'dateDisplay', type: 'text', label: 'Display dates' },
        { name: 'status', type: 'select', options: [...INSTANCE_STATUSES] },
        { name: 'url', type: 'text', label: 'Instance link' },
      ],
    },
    {
      name: 'gallery', type: 'array', label: 'Media gallery',
      labels: { singular: 'Media item', plural: 'Media items' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '/components/ResearchRowLabels#GalleryRowLabel' },
      },
      fields: [
        {
          name: 'type', type: 'select', required: true, defaultValue: 'image',
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Video file', value: 'video' },
            { label: 'YouTube / Vimeo', value: 'embed' },
          ],
        },
        { name: 'url', type: 'text', required: true, label: 'Media URL' },
        {
          name: 'preview', type: 'ui',
          admin: { components: { Field: '/components/MediaPreview#MediaPreview' } },
        },
        { name: 'caption', type: 'textarea' },
      ],
    },
    {
      name: 'press', type: 'array', label: 'Press links',
      labels: { singular: 'Link', plural: 'Links' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '/components/ResearchRowLabels#PressRowLabel' },
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'publisher', type: 'text' },
        {
          name: 'type', type: 'select', required: true, defaultValue: 'press',
          options: [...PRESS_TYPES],
        },
        {
          name: 'preview', type: 'ui',
          admin: {
            components: {
              Field: { path: '/components/MediaPreview#MediaPreview', clientProps: { linkOnly: true } },
            },
          },
        },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
