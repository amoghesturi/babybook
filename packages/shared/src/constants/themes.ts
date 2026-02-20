import type { Theme, ThemeId } from '../types/index';

export const THEMES: Theme[] = [
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    description: 'Pink/lavender — classic baby girl',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    description: 'Green/gold — earthy and warm',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Teal/coral — bright and cheerful',
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    description: 'Orange/red — cozy and warm',
  },
  {
    id: 'night-sky',
    name: 'Night Sky',
    description: 'Purple/gold — dark mode elegance',
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'cotton-candy';
