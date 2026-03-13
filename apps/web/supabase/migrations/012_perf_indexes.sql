-- Composite covering index for the book navigation hot path
-- Matches: WHERE family_id = ? AND deleted_at IS NULL ORDER BY page_date, sort_order
create index if not exists book_pages_nav_idx
  on book_pages(family_id, page_date, sort_order)
  where deleted_at is null;

-- Variant for viewers: also filters on status = 'published'
create index if not exists book_pages_published_nav_idx
  on book_pages(family_id, page_date, sort_order)
  where deleted_at is null and status = 'published';
