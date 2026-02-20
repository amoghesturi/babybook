-- Make the media bucket public so getPublicUrl() works for <img> tags.
-- Paths are {family_id}/{random-uuid}.ext — effectively unguessable.
update storage.buckets
set public = true
where id = 'media';
