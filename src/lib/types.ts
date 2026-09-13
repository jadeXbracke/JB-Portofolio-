export type Discipline = 'portrait' | 'still-life' | 'interiors' | 'documentary' | 'editorial';
export type DisplayWidth = 'full' | 'wide' | 'half' | 'column';

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  portrait: 'Portrait',
  'still-life': 'Still life',
  interiors: 'Interiors',
  documentary: 'Documentary',
  editorial: 'Editorial',
};

/** Where the bytes come from. Sanity in production, generated placeholders in a fresh clone. */
export type ImageSource = { kind: 'sanity'; ref: Record<string, unknown> } | { kind: 'local'; id: string };

export interface Photo {
  key: string;
  alt: string;
  caption?: string;
  displayWidth: DisplayWidth;
  pairWithNext: boolean;
  /** Post-crop pixel dimensions of the master. */
  width: number;
  height: number;
  /** data: URI, ~20px wide */
  lqip: string;
  /** 0..1 focal point inside the cropped image (from the Sanity hotspot). */
  focal: { x: number; y: number };
  src: ImageSource;
}

export interface PortableSpan {
  _type: 'span';
  text: string;
  marks?: string[];
}
export interface PortableBlock {
  _type: 'block';
  _key?: string;
  style?: string;
  children: PortableSpan[];
  markDefs?: { _key: string; _type: string; href?: string }[];
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  year: number;
  location?: string;
  client?: string;
  discipline: Discipline;
  intro: PortableBlock[];
  cover: Photo;
  images: Photo[];
  featured: boolean;
  orderRank: string;
  publishedAt: string;
}

export interface CvItem {
  year?: string;
  text: string;
}

export interface SiteSettings {
  photographerName: string;
  tagline: string;
  aboutBody: PortableBlock[];
  portrait?: Photo;
  email: string;
  phone?: string;
  instagram?: string;
  location: string;
  cvItems: CvItem[];
  clientList: string[];
  availabilityNote?: string;
  seoDefaults: { title: string; description: string; ogImage?: Photo };
}

export interface Homepage {
  heroMode: 'series' | 'image';
  heroSeries?: Series;
  heroImage?: Photo;
  selectedWork: Series[];
}

export interface SiteData {
  settings: SiteSettings;
  homepage: Homepage;
  series: Series[];
  source: 'sanity' | 'local';
}
