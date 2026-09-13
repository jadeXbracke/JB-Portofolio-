import { defineArrayMember, defineField, defineType } from 'sanity';

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroMode',
      title: 'Hero',
      type: 'string',
      description: 'Lead with a whole series (its cover and title) or with one picture.',
      options: {
        list: [
          { title: 'A series', value: 'series' },
          { title: 'One picture', value: 'image' },
        ],
        layout: 'radio',
      },
      initialValue: 'series',
    }),
    defineField({
      name: 'heroSeries',
      title: 'Hero series',
      type: 'reference',
      to: [{ type: 'series' }],
      hidden: ({ document }) => document?.heroMode === 'image',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero picture',
      type: 'photo',
      hidden: ({ document }) => document?.heroMode !== 'image',
    }),
    defineField({
      name: 'selectedWork',
      title: 'Selected work',
      type: 'array',
      description: 'The series shown on the homepage, in this order. Drag to reorder.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'series' }] })],
      validation: (r) => r.unique(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Homepage' }) },
});
