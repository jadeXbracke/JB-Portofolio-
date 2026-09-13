import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';
import { structure } from './src/sanity/structure';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

const SINGLETONS = new Set(['siteSettings', 'homepage']);

export default defineConfig({
  name: 'jadebracke',
  title: 'Jade Bracke',
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    // Singletons cannot be created from the "+" menu; they are opened from the sidebar.
    templates: (templates) => templates.filter((t) => !SINGLETONS.has(t.schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? actions.filter((a) => !['unpublish', 'delete', 'duplicate'].includes(a.action ?? ''))
        : actions,
  },
});
