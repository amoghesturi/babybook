import type { MilestoneCategory } from '../types/index';

export interface MilestoneType {
  id: string;
  name: string;
  category: MilestoneCategory;
  emoji: string;
}

export const MILESTONE_TYPES: MilestoneType[] = [
  // Physical
  { id: 'rolling_over', name: 'Rolling Over', category: 'physical', emoji: '🔄' },
  { id: 'sitting_up', name: 'Sitting Up', category: 'physical', emoji: '🧸' },
  { id: 'crawling', name: 'Crawling', category: 'physical', emoji: '🐛' },
  { id: 'standing', name: 'Standing', category: 'physical', emoji: '🧍' },
  { id: 'first_steps', name: 'First Steps', category: 'physical', emoji: '👣' },
  { id: 'running', name: 'Running', category: 'physical', emoji: '🏃' },
  { id: 'climbing_stairs', name: 'Climbing Stairs', category: 'physical', emoji: '🪜' },

  // Language
  { id: 'first_smile', name: 'First Smile', category: 'language', emoji: '😊' },
  { id: 'first_laugh', name: 'First Laugh', category: 'language', emoji: '😄' },
  { id: 'babbling', name: 'Babbling', category: 'language', emoji: '💬' },
  { id: 'first_word', name: 'First Word', category: 'language', emoji: '🗣️' },
  { id: 'two_word_phrases', name: 'Two-Word Phrases', category: 'language', emoji: '📢' },
  { id: 'says_name', name: 'Says Name', category: 'language', emoji: '✨' },

  // Social
  { id: 'recognizes_parents', name: 'Recognizes Parents', category: 'social', emoji: '👨‍👩‍👧' },
  { id: 'waves_bye', name: 'Waves Bye-Bye', category: 'social', emoji: '👋' },
  { id: 'first_playdate', name: 'First Playdate', category: 'social', emoji: '🎮' },
  { id: 'plays_with_others', name: 'Plays with Others', category: 'social', emoji: '🤝' },
  { id: 'hugs_back', name: 'Hugs Back', category: 'social', emoji: '🤗' },

  // Feeding
  { id: 'first_solid_food', name: 'First Solid Food', category: 'feeding', emoji: '🥣' },
  { id: 'sippy_cup', name: 'Sippy Cup', category: 'feeding', emoji: '🥤' },
  { id: 'self_feeding_spoon', name: 'Self-Feeding with Spoon', category: 'feeding', emoji: '🥄' },
  { id: 'drinks_from_cup', name: 'Drinks from Cup', category: 'feeding', emoji: '🫖' },

  // Sleep
  { id: 'sleeping_through_night', name: 'Sleeping Through the Night', category: 'sleep', emoji: '🌙' },
  { id: 'first_night_in_crib', name: 'First Night in Crib', category: 'sleep', emoji: '🛏️' },
  { id: 'dropped_to_one_nap', name: 'Dropped to One Nap', category: 'sleep', emoji: '😴' },

  // Cognitive
  { id: 'object_permanence', name: 'Object Permanence', category: 'cognitive', emoji: '🎭' },
  { id: 'points_at_objects', name: 'Points at Objects', category: 'cognitive', emoji: '☝️' },
  { id: 'stacks_blocks', name: 'Stacks Blocks', category: 'cognitive', emoji: '🧱' },
  { id: 'pretend_play', name: 'Pretend Play', category: 'cognitive', emoji: '🎪' },
];

export const MILESTONE_CATEGORIES: { id: MilestoneCategory; label: string; emoji: string }[] = [
  { id: 'physical', label: 'Physical', emoji: '💪' },
  { id: 'language', label: 'Language', emoji: '💬' },
  { id: 'social', label: 'Social', emoji: '🤝' },
  { id: 'feeding', label: 'Feeding', emoji: '🍼' },
  { id: 'sleep', label: 'Sleep', emoji: '🌙' },
  { id: 'cognitive', label: 'Cognitive', emoji: '🧠' },
];
