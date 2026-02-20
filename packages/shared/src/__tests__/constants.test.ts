import { describe, it, expect } from 'vitest';
import { MILESTONE_TYPES, MILESTONE_CATEGORIES } from '../constants/milestoneTypes';
import { PAGE_TEMPLATES } from '../constants/pageTemplates';
import { THEMES, DEFAULT_THEME_ID } from '../constants/themes';

// ─── Milestone Types ──────────────────────────────────────────────────────────

describe('MILESTONE_TYPES', () => {
  it('has at least 20 predefined milestone types', () => {
    expect(MILESTONE_TYPES.length).toBeGreaterThanOrEqual(20);
  });

  it('every milestone has id, name, category, and emoji', () => {
    for (const m of MILESTONE_TYPES) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('name');
      expect(m).toHaveProperty('category');
      expect(m).toHaveProperty('emoji');
      expect(m.id.length).toBeGreaterThan(0);
      expect(m.name.length).toBeGreaterThan(0);
    }
  });

  it('all milestone ids are unique', () => {
    const ids = MILESTONE_TYPES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all milestone categories are valid', () => {
    const validCategories = new Set(MILESTONE_CATEGORIES.map((c) => c.id));
    for (const m of MILESTONE_TYPES) {
      expect(validCategories.has(m.category)).toBe(true);
    }
  });

  it('includes "First Steps" in physical category', () => {
    const firstSteps = MILESTONE_TYPES.find((m) => m.name === 'First Steps');
    expect(firstSteps).toBeDefined();
    expect(firstSteps?.category).toBe('physical');
  });

  it('includes "First Word" in language category', () => {
    const firstWord = MILESTONE_TYPES.find((m) => m.name === 'First Word');
    expect(firstWord).toBeDefined();
    expect(firstWord?.category).toBe('language');
  });
});

describe('MILESTONE_CATEGORIES', () => {
  it('has exactly 6 categories', () => {
    expect(MILESTONE_CATEGORIES.length).toBe(6);
  });

  it('every category has id, label, and emoji', () => {
    for (const c of MILESTONE_CATEGORIES) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('label');
      expect(c).toHaveProperty('emoji');
    }
  });

  it('includes all expected category ids', () => {
    const ids = MILESTONE_CATEGORIES.map((c) => c.id);
    expect(ids).toContain('physical');
    expect(ids).toContain('language');
    expect(ids).toContain('social');
    expect(ids).toContain('feeding');
    expect(ids).toContain('sleep');
    expect(ids).toContain('cognitive');
  });
});

// ─── Page Templates ───────────────────────────────────────────────────────────

describe('PAGE_TEMPLATES', () => {
  it('has exactly 7 templates', () => {
    expect(PAGE_TEMPLATES.length).toBe(7);
  });

  it('every template has type, label, description, emoji', () => {
    for (const t of PAGE_TEMPLATES) {
      expect(t).toHaveProperty('type');
      expect(t).toHaveProperty('label');
      expect(t).toHaveProperty('description');
      expect(t).toHaveProperty('emoji');
    }
  });

  it('includes all required page types', () => {
    const types = PAGE_TEMPLATES.map((t) => t.type);
    expect(types).toContain('cover');
    expect(types).toContain('birth_story');
    expect(types).toContain('milestone');
    expect(types).toContain('photo_spread');
    expect(types).toContain('journal');
    expect(types).toContain('letter');
    expect(types).toContain('monthly_summary');
  });

  it('photo_spread template has layout variants', () => {
    const photoSpread = PAGE_TEMPLATES.find((t) => t.type === 'photo_spread');
    expect(photoSpread).toBeDefined();
    expect(photoSpread?.variants).toBeDefined();
    expect(Array.isArray(photoSpread?.variants)).toBe(true);
    expect(photoSpread!.variants!.length).toBeGreaterThan(0);
  });

  it('all page type values are unique', () => {
    const types = PAGE_TEMPLATES.map((t) => t.type);
    expect(new Set(types).size).toBe(types.length);
  });
});

// ─── Themes ───────────────────────────────────────────────────────────────────

describe('THEMES', () => {
  it('has exactly 5 themes', () => {
    expect(THEMES.length).toBe(5);
  });

  it('every theme has id, name, and description', () => {
    for (const theme of THEMES) {
      expect(theme).toHaveProperty('id');
      expect(theme).toHaveProperty('name');
      expect(theme).toHaveProperty('description');
    }
  });

  it('DEFAULT_THEME_ID is "cotton-candy"', () => {
    expect(DEFAULT_THEME_ID).toBe('cotton-candy');
  });

  it('DEFAULT_THEME_ID exists in THEMES list', () => {
    const found = THEMES.find((t) => t.id === DEFAULT_THEME_ID);
    expect(found).toBeDefined();
  });

  it('includes all 5 expected theme ids', () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toContain('cotton-candy');
    expect(ids).toContain('jungle');
    expect(ids).toContain('ocean');
    expect(ids).toContain('autumn-leaves');
    expect(ids).toContain('night-sky');
  });
});
