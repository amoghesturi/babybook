-- Add 'section_title' to book_pages page_type check constraint
alter table book_pages drop constraint book_pages_page_type_check;
alter table book_pages add constraint book_pages_page_type_check
  check (page_type in (
    'cover','birth_story','milestone','photo_spread',
    'journal','letter','monthly_summary','section_title'
  ));
