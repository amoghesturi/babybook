import type { Theme, ThemeId } from '../types/index';

export const THEMES: Theme[] = [
  {
    id: 'meadow',
    name: 'Meadow',
    description: 'Sage green & amber — warm, natural, gender-neutral',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Teal & coral — bright and cheerful',
  },
  {
    id: 'night-sky',
    name: 'Night Sky',
    description: 'Purple & gold — dark mode elegance',
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    description: 'Amber & red — cozy and warm',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    description: 'Forest green & gold — earthy and adventurous',
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    description: 'Pink & lavender — soft and sweet',
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'meadow';
