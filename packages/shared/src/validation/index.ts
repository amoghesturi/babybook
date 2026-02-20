import { z } from 'zod';

export const CoverContentSchema = z.object({
  book_title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  cover_photo_storage_path: z.string().optional(),
});

export const BirthStoryContentSchema = z.object({
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_of_birth: z.string().optional(),
  weight_kg: z.number().positive().max(20),
  height_cm: z.number().positive().max(100),
  hospital: z.string().max(200).optional(),
  story_text: z.string().max(10000).optional(),
  photo_storage_path: z.string().optional(),
});

export const MilestoneContentSchema = z.object({
  milestone_name: z.string().min(1).max(100),
  category: z.enum(['physical', 'language', 'social', 'feeding', 'sleep', 'cognitive']),
  achieved_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(2000).optional(),
  photo_storage_path: z.string().optional(),
});

export const PhotoItemSchema = z.object({
  storage_path: z.string().min(1),
  caption: z.string().max(300).optional(),
  public_url: z.string().optional(),
});

export const PhotoSpreadContentSchema = z.object({
  layout: z.enum(['single', 'grid', 'polaroid']),
  photos: z.array(PhotoItemSchema).min(1).max(4),
});

// Tiptap content is arbitrary JSON
export const TiptapContentSchema = z.record(z.unknown());

export const JournalContentSchema = z.object({
  title: z.string().min(1).max(200),
  content_tiptap: TiptapContentSchema,
  mood: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  header_photo_storage_path: z.string().optional(),
});

export const LetterContentSchema = z.object({
  author_name: z.string().min(1).max(100),
  content_tiptap: TiptapContentSchema,
  reveal_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const MonthlySummaryContentSchema = z.object({
  year_month: z.string().regex(/^\d{4}-\d{2}$/),
  weight_kg: z.number().positive().max(50).optional(),
  height_cm: z.number().positive().max(200).optional(),
  notes: z.string().max(2000).optional(),
  highlight_page_ids: z.array(z.string().uuid()).max(10).optional(),
});

export const ContentSchemaMap = {
  cover: CoverContentSchema,
  birth_story: BirthStoryContentSchema,
  milestone: MilestoneContentSchema,
  photo_spread: PhotoSpreadContentSchema,
  journal: JournalContentSchema,
  letter: LetterContentSchema,
  monthly_summary: MonthlySummaryContentSchema,
} as const;

export type ContentSchemaKey = keyof typeof ContentSchemaMap;
