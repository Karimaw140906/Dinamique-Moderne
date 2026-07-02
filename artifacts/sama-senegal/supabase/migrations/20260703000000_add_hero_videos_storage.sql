-- Bucket public pour les vidéos hero par catégorie de page
insert into storage.buckets (id, name, public)
values ('hero-videos', 'hero-videos', true)
on conflict (id) do nothing;

drop policy if exists "hero_videos_public_read" on storage.objects;
create policy "hero_videos_public_read"
on storage.objects for select
using (bucket_id = 'hero-videos');

drop policy if exists "hero_videos_public_write" on storage.objects;
create policy "hero_videos_public_write"
on storage.objects for insert
with check (bucket_id = 'hero-videos');

drop policy if exists "hero_videos_public_update" on storage.objects;
create policy "hero_videos_public_update"
on storage.objects for update
using (bucket_id = 'hero-videos');

drop policy if exists "hero_videos_public_delete" on storage.objects;
create policy "hero_videos_public_delete"
on storage.objects for delete
using (bucket_id = 'hero-videos');
