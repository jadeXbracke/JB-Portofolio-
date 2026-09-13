// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// When no project id is configured the site builds from seed/content.json and the
// generated placeholder images (see src/lib/cms.ts). 'placeholder' keeps the Sanity
// client constructor happy; nothing is fetched from it.
const projectId = env.PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  site: env.SITE_URL || 'https://jadebracke.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: true,
      apiVersion: '2025-02-19',
      studioBasePath: '/studio',
      // Hash routing lets the Studio be a fully static page (no server adapter needed).
      // Studio URLs look like /studio/#/structure/series — that is expected.
      studioRouterHistory: 'hash',
    }),
    react(),
    sitemap({
      filter: (page) => !/\/studio\/?$|\/404\/?$/.test(page),
    }),
  ],
  vite: {
    build: { assetsInlineLimit: 0 },
  },
});
