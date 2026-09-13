import { defineField, defineType } from 'sanity';

/**
 * The image object used everywhere (series covers, series images, the portrait).
 * `alt` is required: the Studio refuses to publish without it.
 * `displayWidth` and `pairWithNext` are the photographer's rhythm controls — the layouts
 * obey them; they never decide a width on their own.
 */
export const photo = defineType({
  name: 'photo',
  title: 'Photograph',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'What is in the picture, in one plain sentence. Required — used by screen readers and search engines.',
      validation: (rule) => rule.required().min(4).error('Every photograph needs alt text before it can be published.'),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional. Shown next to the picture in most layouts.',
    }),
    defineField({
      name: 'displayWidth',
      title: 'Display width',
      type: 'string',
      description: 'How much of the page this picture takes. Full bleeds edge to edge; column is a single reading column.',
      options: {
        list: [
          { title: 'Full', value: 'full' },
          { title: 'Wide', value: 'wide' },
          { title: 'Half', value: 'half' },
          { title: 'Column', value: 'column' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'wide',
    }),
    defineField({
      name: 'pairWithNext',
      title: 'Pair with next picture',
      type: 'boolean',
      description: 'Puts this picture and the one after it side by side.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { media: 'asset', title: 'alt', subtitle: 'displayWidth' },
  },
});
