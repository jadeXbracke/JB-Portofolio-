import type { StructureResolver } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';

/**
 * Studio sidebar: Series (drag to reorder), Homepage, Site settings.
 * The two singletons open straight into their one document.
 */
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({ type: 'series', title: 'Series', S, context }),
      S.divider(),
      S.listItem().title('Homepage').id('homepage').child(S.document().schemaType('homepage').documentId('homepage')),
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ]);
