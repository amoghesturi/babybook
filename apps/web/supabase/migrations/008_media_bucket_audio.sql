-- Add audio/webm and audio/ogg to the media bucket's allowed MIME types
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg',
  'video/mp4', 'video/webm'
]
where id = 'media';
