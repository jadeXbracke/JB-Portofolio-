import { defineArrayMember, defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export const DISCIPLINES = [
  { title: 'Portrait', value: 'portrait' },
  { title: 'Still life', value: 'still-life' },
  { title: 'Interiors', value: 'interiors' },
  { title: 'Documentary', value: 'documentary' },
  { title: 'Editorial', value: 'editorial' },
] as const;

export const series = defineType({
  name: 'series',
  title: 'Series',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'series' }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'Generated from the title. Becomes /work/<this>.',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'year', title: 'Year', type: 'number', validation: (r) => r.required().integer().min(2000).max(2100) }),
    defineField({ name: 'location', title: 'Location', type: 'string', description: 'City, or city and country.' }),
    defineField({ name: 'client', title: 'Client', type: 'string', description: 'Optional.' }),
    defineField({
      name: 'discipline',
      title: 'Discipline',
      type: 'string',
      options: { list: [...DISCIPLINES], layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'array',
      description: 'A short paragraph, about 400 characters. Plain and specific.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [{ title: 'Emphasis', value: 'em' }],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        }),
      ],
      validation: (r) =>
        r.custom((blocks) => {
          const text = (blocks ?? [])
            .flatMap((b: any) => b.children ?? [])
            .map((c: any) => c.text ?? '')
            .join(' ');
          return text.length > 440 ? `Keep the intro under 400 characters (now ${text.length}).` : true;
        }),
    }),
    defineField({ name: 'coverImage', title: 'Cover', type: 'photo', validation: (r) => r.required() }),
    defineField({
      name: 'images',
      title: 'Pictures',
      type: 'array',
      description: 'Drag to reorder. Each picture has its own width setting.',
      of: [defineArrayMember({ type: 'photo' })],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured series are eligible for the homepage selection.',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: 'title', year: 'year', discipline: 'discipline', media: 'coverImage' },
    prepare: ({ title, year, discipline, media }) => ({
      title,
      subtitle: [year, discipline].filter(Boolean).join(' — '),
      media,
    }),
  },
});
