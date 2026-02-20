import { describe, it, expect } from 'vitest';
import {
  CoverContentSchema,
  BirthStoryContentSchema,
  MilestoneContentSchema,
  PhotoSpreadContentSchema,
  JournalContentSchema,
  LetterContentSchema,
  MonthlySummaryContentSchema,
} from '../validation';

// ─── CoverPage ───────────────────────────────────────────────────────────────

describe('CoverContentSchema', () => {
  it('accepts a minimal valid cover', () => {
    const result = CoverContentSchema.safeParse({ book_title: "Lily's Book" });
    expect(result.success).toBe(true);
  });

  it('accepts a full cover with subtitle and photo', () => {
    const result = CoverContentSchema.safeParse({
      book_title: "Lily's First Year",
      subtitle: 'A year of wonder',
      cover_photo_storage_path: 'family-uuid/cover.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty book_title', () => {
    const result = CoverContentSchema.safeParse({ book_title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a book_title longer than 100 characters', () => {
    const result = CoverContentSchema.safeParse({ book_title: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects a subtitle longer than 200 characters', () => {
    const result = CoverContentSchema.safeParse({
      book_title: 'Good title',
      subtitle: 'B'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

// ─── BirthStory ──────────────────────────────────────────────────────────────

describe('BirthStoryContentSchema', () => {
  const valid = {
    date_of_birth: '2024-03-15',
    weight_kg: 3.5,
    height_cm: 51,
  };

  it('accepts minimal required fields', () => {
    expect(BirthStoryContentSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = BirthStoryContentSchema.safeParse({
      ...valid,
      time_of_birth: '14:32',
      hospital: 'City Hospital',
      story_text: 'She arrived on a sunny afternoon…',
      photo_storage_path: 'family/newborn.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weight over 20 kg', () => {
    expect(BirthStoryContentSchema.safeParse({ ...valid, weight_kg: 21 }).success).toBe(false);
  });

  it('rejects weight below 0', () => {
    expect(BirthStoryContentSchema.safeParse({ ...valid, weight_kg: -1 }).success).toBe(false);
  });

  it('rejects height over 100 cm', () => {
    expect(BirthStoryContentSchema.safeParse({ ...valid, height_cm: 101 }).success).toBe(false);
  });

  it('rejects an invalid date_of_birth format', () => {
    expect(BirthStoryContentSchema.safeParse({ ...valid, date_of_birth: '15/03/2024' }).success).toBe(false);
  });
});

// ─── Milestone ───────────────────────────────────────────────────────────────

describe('MilestoneContentSchema', () => {
  const valid = {
    milestone_name: 'First Steps',
    category: 'physical',
    achieved_at: '2024-10-01',
  };

  it('accepts a valid milestone', () => {
    expect(MilestoneContentSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a milestone with notes and photo', () => {
    const result = MilestoneContentSchema.safeParse({
      ...valid,
      notes: 'She took her first steps towards the dog!',
      photo_storage_path: 'family/steps.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty milestone_name', () => {
    expect(MilestoneContentSchema.safeParse({ ...valid, milestone_name: '' }).success).toBe(false);
  });

  it('rejects a milestone_name over 100 characters', () => {
    expect(MilestoneContentSchema.safeParse({ ...valid, milestone_name: 'X'.repeat(101) }).success).toBe(false);
  });

  it('rejects an invalid category', () => {
    expect(MilestoneContentSchema.safeParse({ ...valid, category: 'emotional' }).success).toBe(false);
  });

  it('rejects notes over 2000 characters', () => {
    expect(MilestoneContentSchema.safeParse({ ...valid, notes: 'N'.repeat(2001) }).success).toBe(false);
  });

  it('rejects an invalid date format for achieved_at', () => {
    expect(MilestoneContentSchema.safeParse({ ...valid, achieved_at: '01-10-2024' }).success).toBe(false);
  });
});

// ─── PhotoSpread ─────────────────────────────────────────────────────────────

describe('PhotoSpreadContentSchema', () => {
  const singlePhoto = { storage_path: 'family/a.jpg', caption: 'Park day' };

  it('accepts a single-layout spread', () => {
    const result = PhotoSpreadContentSchema.safeParse({
      layout: 'single',
      photos: [singlePhoto],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a grid spread with 4 photos', () => {
    const result = PhotoSpreadContentSchema.safeParse({
      layout: 'grid',
      photos: [singlePhoto, singlePhoto, singlePhoto, singlePhoto],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a polaroid spread with photos and no captions', () => {
    const result = PhotoSpreadContentSchema.safeParse({
      layout: 'polaroid',
      photos: [{ storage_path: 'family/b.jpg' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty photos array', () => {
    expect(PhotoSpreadContentSchema.safeParse({ layout: 'grid', photos: [] }).success).toBe(false);
  });

  it('rejects more than 4 photos', () => {
    const photos = Array(5).fill(singlePhoto);
    expect(PhotoSpreadContentSchema.safeParse({ layout: 'grid', photos }).success).toBe(false);
  });

  it('rejects an invalid layout', () => {
    expect(PhotoSpreadContentSchema.safeParse({ layout: 'collage', photos: [singlePhoto] }).success).toBe(false);
  });

  it('rejects a caption over 300 characters', () => {
    const result = PhotoSpreadContentSchema.safeParse({
      layout: 'single',
      photos: [{ storage_path: 'family/a.jpg', caption: 'C'.repeat(301) }],
    });
    expect(result.success).toBe(false);
  });
});

// ─── Journal ─────────────────────────────────────────────────────────────────

describe('JournalContentSchema', () => {
  const tiptap = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] };

  it('accepts a minimal journal entry', () => {
    const result = JournalContentSchema.safeParse({ title: 'Day at the park', content_tiptap: tiptap });
    expect(result.success).toBe(true);
  });

  it('accepts a journal with all optional fields', () => {
    const result = JournalContentSchema.safeParse({
      title: 'Day at the park',
      content_tiptap: tiptap,
      mood: 'happy',
      tags: ['family', 'outdoor'],
      header_photo_storage_path: 'family/park.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(JournalContentSchema.safeParse({ title: '', content_tiptap: tiptap }).success).toBe(false);
  });

  it('rejects a title over 200 characters', () => {
    expect(JournalContentSchema.safeParse({ title: 'T'.repeat(201), content_tiptap: tiptap }).success).toBe(false);
  });

  it('rejects more than 10 tags', () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(JournalContentSchema.safeParse({ title: 'X', content_tiptap: tiptap, tags }).success).toBe(false);
  });
});

// ─── Letter ──────────────────────────────────────────────────────────────────

describe('LetterContentSchema', () => {
  const tiptap = { type: 'doc', content: [] };

  it('accepts a minimal letter', () => {
    const result = LetterContentSchema.safeParse({ author_name: 'Mum', content_tiptap: tiptap });
    expect(result.success).toBe(true);
  });

  it('accepts a letter with a future reveal_date', () => {
    const result = LetterContentSchema.safeParse({
      author_name: 'Mum',
      content_tiptap: tiptap,
      reveal_date: '2030-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty author_name', () => {
    expect(LetterContentSchema.safeParse({ author_name: '', content_tiptap: tiptap }).success).toBe(false);
  });

  it('rejects an author_name over 100 characters', () => {
    expect(LetterContentSchema.safeParse({ author_name: 'A'.repeat(101), content_tiptap: tiptap }).success).toBe(false);
  });

  it('rejects an invalid reveal_date format', () => {
    const result = LetterContentSchema.safeParse({
      author_name: 'Dad',
      content_tiptap: tiptap,
      reveal_date: '1st Jan 2030',
    });
    expect(result.success).toBe(false);
  });
});

// ─── MonthlySummary ──────────────────────────────────────────────────────────

describe('MonthlySummaryContentSchema', () => {
  it('accepts a minimal monthly summary', () => {
    const result = MonthlySummaryContentSchema.safeParse({ year_month: '2024-06' });
    expect(result.success).toBe(true);
  });

  it('accepts a full summary with stats', () => {
    const result = MonthlySummaryContentSchema.safeParse({
      year_month: '2024-06',
      weight_kg: 8.2,
      height_cm: 68,
      notes: 'Started crawling this month!',
      highlight_page_ids: ['550e8400-e29b-41d4-a716-446655440000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid year_month format', () => {
    expect(MonthlySummaryContentSchema.safeParse({ year_month: '06-2024' }).success).toBe(false);
  });

  it('rejects weight over 50 kg', () => {
    expect(MonthlySummaryContentSchema.safeParse({ year_month: '2024-06', weight_kg: 51 }).success).toBe(false);
  });

  it('rejects height over 200 cm', () => {
    expect(MonthlySummaryContentSchema.safeParse({ year_month: '2024-06', height_cm: 201 }).success).toBe(false);
  });
});
