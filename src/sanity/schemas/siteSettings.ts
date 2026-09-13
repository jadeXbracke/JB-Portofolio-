import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * One document. Everything that identifies the photographer lives here and nowhere
 * else — components read it, never hard-code it.
 *
 * Locale note: a Dutch version can be added later by making `tagline`, `aboutBody`,
 * `availabilityNote` and `seoDefaults` field-level localised objects ({en, nl}) via
 * sanity-plugin-internationalized-array, and adding `title`/`intro` the same way on
 * series. The document ids and slugs stay; the queries pick the locale. No rewrite.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'photographerName', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'One line under the name. Plain and specific — what you shoot and where.',
      validation: (r) => r.required().max(90),
    }),
    defineField({
      name: 'aboutBody',
      title: 'About',
      type: 'array',
      of: [defineArrayMember({ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], lists: [] })],
    }),
    defineField({ name: 'portrait', title: 'Portrait', type: 'photo' }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (r) => r.required().email() }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({
      name: 'instagram',
      title: 'Instagram handle',
      type: 'string',
      description: 'Without the @.',
      validation: (r) => r.regex(/^[A-Za-z0-9._]+$/).error('Just the handle, no @ and no URL.'),
    }),
    defineField({ name: 'location', title: 'Based in', type: 'string', initialValue: 'Amsterdam' }),
    defineField({
      name: 'cvItems',
      title: 'CV',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'cvItem',
          fields: [
            defineField({ name: 'year', title: 'Year', type: 'string' }),
            defineField({ name: 'text', title: 'Entry', type: 'string' }),
          ],
          preview: { select: { title: 'text', subtitle: 'year' } },
        }),
      ],
    }),
    defineField({ name: 'clientList', title: 'Clients', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    defineField({
      name: 'availabilityNote',
      title: 'Availability',
      type: 'string',
      description: 'For example: "Booking from November 2026." Shown on the contact page.',
    }),
    defineField({
      name: 'seoDefaults',
      title: 'Search and sharing defaults',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Site title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (r) => r.max(160) }),
        defineField({ name: 'ogImage', title: 'Sharing image', type: 'photo' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
