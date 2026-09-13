import { ldImageUrl } from './image';
import { DISCIPLINE_LABEL, type Photo, type Series, type SiteSettings } from './types';
import { toText } from './portable';

const abs = (site: URL | undefined, path: string) => (site ? new URL(path, site).toString() : path);

export function personLd(s: SiteSettings, site: URL | undefined, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': abs(site, '/#person'),
    name: s.photographerName,
    jobTitle: 'Photographer',
    description: s.tagline,
    email: `mailto:${s.email}`,
    telephone: s.phone,
    url: pageUrl,
    address: { '@type': 'PostalAddress', addressLocality: s.location, addressCountry: 'NL' },
    sameAs: s.instagram ? [`https://www.instagram.com/${s.instagram}/`] : undefined,
    image: s.portrait ? ldImageUrl(s.portrait) : undefined,
  };
}

export function imageLd(p: Photo, s: SiteSettings, site: URL | undefined) {
  return {
    '@type': 'ImageObject',
    contentUrl: abs(site, ldImageUrl(p)),
    width: p.width,
    height: p.height,
    name: p.alt,
    caption: p.caption,
    creator: { '@id': abs(site, '/#person') },
    copyrightHolder: { '@id': abs(site, '/#person') },
    creditText: s.photographerName,
    license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    acquireLicensePage: abs(site, '/contact'),
  };
}

export function seriesLd(series: Series, s: SiteSettings, site: URL | undefined, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: series.title,
    url: pageUrl,
    description: toText(series.intro) || undefined,
    dateCreated: String(series.year),
    locationCreated: series.location ? { '@type': 'Place', name: series.location } : undefined,
    genre: DISCIPLINE_LABEL[series.discipline],
    creator: { '@id': abs(site, '/#person') },
    sponsor: series.client ? { '@type': 'Organization', name: series.client } : undefined,
    image: abs(site, ldImageUrl(series.cover)),
    hasPart: series.images.map((p) => imageLd(p, s, site)),
  };
}
