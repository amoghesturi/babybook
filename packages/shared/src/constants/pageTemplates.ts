import type { PageType, SectionType } from '../types/index';

export interface TemplateVariantMeta {
  id: string;
  label: string;
  description: string;
}

export interface PageTemplate {
  type: PageType;
  label: string;
  description: string;
  emoji: string;
  defaultVariant: string;
  variants: TemplateVariantMeta[];
  /** For section_title pages: which section_type values show variant options (only 'custom') */
  variantSectionTypes?: SectionType[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    type: 'cover',
    label: 'Cover Page',
    description: 'The cover of your baby book',
    emoji: '📖',
    defaultVariant: 'classic',
    variants: [
      { id: 'classic',    label: 'Classic',    description: 'Decorative frame with polka-dot texture' },
      { id: 'minimal',    label: 'Minimal',    description: 'Clean large typography, no ornaments' },
      { id: 'watercolor', label: 'Watercolor', description: 'Soft gradient washes with botanical accent' },
    ],
  },
  {
    type: 'birth_story',
    label: 'Birth Story',
    description: 'Birth stats and the story of arrival',
    emoji: '👶',
    defaultVariant: 'classic',
    variants: [
      { id: 'classic',      label: 'Classic',      description: 'Star cluster header, stats row, story + photo' },
      { id: 'announcement', label: 'Announcement', description: 'Centered birth announcement card style' },
      { id: 'scrapbook',    label: 'Scrapbook',    description: 'Washi tape accents, handwritten feel' },
    ],
  },
  {
    type: 'milestone',
    label: 'Milestone',
    description: 'A special achievement or first',
    emoji: '⭐',
    defaultVariant: 'classic',
    variants: [
      { id: 'classic',     label: 'Classic',     description: 'Sunburst background with confetti' },
      { id: 'badge',       label: 'Badge',       description: 'Round medal circle with ribbon' },
      { id: 'certificate', label: 'Certificate', description: 'Formal certificate with ornate border' },
    ],
  },
  {
    type: 'photo_spread',
    label: 'Photo Spread',
    description: 'Beautiful photo layout',
    emoji: '📸',
    defaultVariant: 'polaroid',
    variants: [
      { id: 'single',   label: 'Single',   description: 'One full-bleed photo with caption' },
      { id: 'grid',     label: 'Grid',     description: 'Up to 4 photos in a film-strip grid' },
      { id: 'polaroid', label: 'Polaroid', description: 'Tilted polaroid frames with captions' },
    ],
  },
  {
    type: 'journal',
    label: 'Journal Entry',
    description: 'A diary entry about a special moment',
    emoji: '📝',
    defaultVariant: 'classic',
    variants: [
      { id: 'classic', label: 'Classic', description: 'Ruled paper with binder spine' },
      { id: 'clean',   label: 'Clean',   description: 'White card, no lines, minimal style' },
      { id: 'vibrant', label: 'Vibrant', description: 'Bold color header band with accent bar' },
    ],
  },
  {
    type: 'letter',
    label: 'Letter',
    description: 'A letter to your child (can be time-locked)',
    emoji: '💌',
    defaultVariant: 'classic',
    variants: [
      { id: 'classic',  label: 'Classic',  description: 'Parchment paper with wax seal' },
      { id: 'modern',   label: 'Modern',   description: 'Clean white with minimal border' },
      { id: 'postcard', label: 'Postcard', description: 'Split panel with decorative stamp' },
    ],
  },
  {
    type: 'monthly_summary',
    label: 'Monthly Summary',
    description: "A snapshot of the month's highlights",
    emoji: '📅',
    defaultVariant: 'classic',
    variants: [
      { id: 'classic',     label: 'Classic',     description: 'Giant ghost month text background' },
      { id: 'infographic', label: 'Infographic', description: 'Stats-forward card grid layout' },
      { id: 'clean',       label: 'Clean',       description: 'Minimal white card, subtle stats' },
    ],
  },
  {
    type: 'section_title',
    label: 'Section Title',
    description: 'A decorative divider page for the section',
    emoji: '📑',
    defaultVariant: 'elegant',
    variantSectionTypes: ['custom'],
    variants: [
      { id: 'elegant', label: 'Elegant', description: 'Minimal monogram style with decorative rules' },
      { id: 'playful', label: 'Playful', description: 'Bold color fills with circle confetti' },
    ],
  },
];
