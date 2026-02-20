export type PageType =
  | 'cover'
  | 'birth_story'
  | 'milestone'
  | 'photo_spread'
  | 'journal'
  | 'letter'
  | 'monthly_summary';

export type PageStatus = 'draft' | 'published';

export type MemberRole = 'owner' | 'viewer';

export type InviteStatus = 'pending' | 'accepted';

export type MediaType = 'photo' | 'audio' | 'video';

export type PhotoLayout = 'single' | 'grid' | 'polaroid';

// ─── Content shapes (JSONB in DB) ──────────────────────────────────────────

export interface CoverContent {
  book_title: string;
  subtitle?: string;
  cover_photo_storage_path?: string;
}

export interface BirthStoryContent {
  date_of_birth: string; // ISO date string
  time_of_birth?: string;
  weight_kg: number;
  height_cm: number;
  hospital?: string;
  story_text?: string;
  photo_storage_path?: string;
}

export interface MilestoneContent {
  milestone_name: string;
  category: MilestoneCategory;
  achieved_at: string; // ISO date string
  notes?: string;
  photo_storage_path?: string;
}

export interface PhotoItem {
  storage_path: string;
  caption?: string;
  public_url?: string;
}

export interface PhotoSpreadContent {
  layout: PhotoLayout;
  photos: PhotoItem[];
}

// Tiptap JSON content type (simplified)
export type TiptapContent = Record<string, unknown>;

export interface JournalContent {
  title: string;
  content_tiptap: TiptapContent;
  mood?: string;
  tags?: string[];
  header_photo_storage_path?: string;
}

export interface LetterContent {
  author_name: string;
  content_tiptap: TiptapContent;
  reveal_date?: string; // ISO date string
}

export interface MonthlySummaryContent {
  year_month: string; // YYYY-MM
  weight_kg?: number;
  height_cm?: number;
  notes?: string;
  highlight_page_ids?: string[];
}

export type PageContent =
  | CoverContent
  | BirthStoryContent
  | MilestoneContent
  | PhotoSpreadContent
  | JournalContent
  | LetterContent
  | MonthlySummaryContent;

// ─── Database row types ─────────────────────────────────────────────────────

export interface Family {
  id: string;
  name: string;
  theme_id: string;
  created_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  date_of_birth: string;
  gender?: 'male' | 'female' | 'other';
  avatar_url?: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id?: string;
  email: string;
  role: MemberRole;
  invite_token?: string;
  invite_status: InviteStatus;
  created_at: string;
}

export interface BookPage {
  id: string;
  family_id: string;
  child_id: string;
  page_type: PageType;
  template_variant?: string;
  page_date: string;
  sort_order: number;
  status: PageStatus;
  content: PageContent;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  family_id: string;
  child_id: string;
  storage_path: string;
  public_url: string;
  media_type: MediaType;
  file_size: number;
  taken_at?: string;
  created_at: string;
}

// ─── Milestone categories ───────────────────────────────────────────────────

export type MilestoneCategory =
  | 'physical'
  | 'language'
  | 'social'
  | 'feeding'
  | 'sleep'
  | 'cognitive';

// ─── Theme ─────────────────────────────────────────────────────────────────

export type ThemeId =
  | 'cotton-candy'
  | 'jungle'
  | 'ocean'
  | 'autumn-leaves'
  | 'night-sky';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
}

// ─── UI helpers ─────────────────────────────────────────────────────────────

export interface NavigationInfo {
  prevPageId: string | null;
  nextPageId: string | null;
  currentIndex: number;
  totalPages: number;
}
