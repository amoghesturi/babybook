import type { PageType } from '../types/index';

export interface PageTemplate {
  type: PageType;
  label: string;
  description: string;
  emoji: string;
  variants?: string[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    type: 'cover',
    label: 'Cover Page',
    description: 'The cover of your baby book',
    emoji: '📖',
  },
  {
    type: 'birth_story',
    label: 'Birth Story',
    description: 'Birth stats and the story of arrival',
    emoji: '👶',
  },
  {
    type: 'milestone',
    label: 'Milestone',
    description: 'A special achievement or first',
    emoji: '⭐',
  },
  {
    type: 'photo_spread',
    label: 'Photo Spread',
    description: 'Beautiful photo layout',
    emoji: '📸',
    variants: ['single', 'grid', 'polaroid'],
  },
  {
    type: 'journal',
    label: 'Journal Entry',
    description: 'A diary entry about a special moment',
    emoji: '📝',
  },
  {
    type: 'letter',
    label: 'Letter',
    description: 'A letter to your child (can be time-locked)',
    emoji: '💌',
  },
  {
    type: 'monthly_summary',
    label: 'Monthly Summary',
    description: "A snapshot of the month's highlights",
    emoji: '📅',
  },
];
