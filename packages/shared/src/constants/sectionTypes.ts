import type { SectionType, PageType } from '../types/index';

export interface PresetPage {
  page_type: PageType;
  description: string;
  /** Month offset from child DOB for monthly_summary pages (1 = first month of life) */
  month_offset?: number;
}

export interface SectionTypeMeta {
  id: SectionType;
  label: string;
  description: string;
  emoji: string;
  presetPages: PresetPage[];
}

export const SECTION_TYPES: SectionTypeMeta[] = [
  {
    id: 'pregnancy',
    label: 'Pregnancy',
    description: 'The journey before baby arrived',
    emoji: '🤰',
    presetPages: [
      { page_type: 'journal', description: 'Pregnancy journal entry' },
      { page_type: 'letter',  description: 'Letter to unborn child' },
    ],
  },
  {
    id: 'birth',
    label: 'Birth',
    description: 'The arrival day',
    emoji: '👶',
    presetPages: [
      { page_type: 'birth_story', description: 'Birth story page' },
    ],
  },
  {
    id: 'newborn_0_3',
    label: 'Newborn (0–3 months)',
    description: 'The first three months of life',
    emoji: '🐣',
    presetPages: [
      { page_type: 'monthly_summary', description: 'Month 1 summary', month_offset: 1 },
      { page_type: 'monthly_summary', description: 'Month 2 summary', month_offset: 2 },
      { page_type: 'monthly_summary', description: 'Month 3 summary', month_offset: 3 },
    ],
  },
  {
    id: 'first_6_months',
    label: 'First 6 Months',
    description: 'Months 4 through 6',
    emoji: '🌱',
    presetPages: [
      { page_type: 'monthly_summary', description: 'Month 4 summary', month_offset: 4 },
      { page_type: 'monthly_summary', description: 'Month 5 summary', month_offset: 5 },
      { page_type: 'monthly_summary', description: 'Month 6 summary', month_offset: 6 },
      { page_type: 'milestone',       description: 'Milestone page' },
    ],
  },
  {
    id: 'second_6_months',
    label: 'Second 6 Months',
    description: 'Months 7 through 12',
    emoji: '🏃',
    presetPages: [
      { page_type: 'monthly_summary', description: 'Month 7 summary',  month_offset: 7 },
      { page_type: 'monthly_summary', description: 'Month 8 summary',  month_offset: 8 },
      { page_type: 'monthly_summary', description: 'Month 9 summary',  month_offset: 9 },
      { page_type: 'monthly_summary', description: 'Month 10 summary', month_offset: 10 },
      { page_type: 'monthly_summary', description: 'Month 11 summary', month_offset: 11 },
      { page_type: 'monthly_summary', description: 'Month 12 summary', month_offset: 12 },
      { page_type: 'milestone',       description: 'Milestone page' },
    ],
  },
  {
    id: 'toddler',
    label: 'Toddler Years',
    description: 'Months 13 through 24',
    emoji: '🧒',
    presetPages: [
      { page_type: 'monthly_summary', description: 'Month 13 summary', month_offset: 13 },
      { page_type: 'monthly_summary', description: 'Month 14 summary', month_offset: 14 },
      { page_type: 'monthly_summary', description: 'Month 15 summary', month_offset: 15 },
      { page_type: 'monthly_summary', description: 'Month 16 summary', month_offset: 16 },
      { page_type: 'monthly_summary', description: 'Month 17 summary', month_offset: 17 },
      { page_type: 'monthly_summary', description: 'Month 18 summary', month_offset: 18 },
      { page_type: 'monthly_summary', description: 'Month 19 summary', month_offset: 19 },
      { page_type: 'monthly_summary', description: 'Month 20 summary', month_offset: 20 },
      { page_type: 'monthly_summary', description: 'Month 21 summary', month_offset: 21 },
      { page_type: 'monthly_summary', description: 'Month 22 summary', month_offset: 22 },
      { page_type: 'monthly_summary', description: 'Month 23 summary', month_offset: 23 },
      { page_type: 'monthly_summary', description: 'Month 24 summary', month_offset: 24 },
      { page_type: 'milestone', description: 'Milestone page' },
      { page_type: 'letter',    description: 'Letter to toddler' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom Section',
    description: 'Add your own pages with no preset',
    emoji: '✏️',
    presetPages: [],
  },
];
