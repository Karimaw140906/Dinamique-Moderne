-- Ajoute le support photo/vidéo + file d'attente de validation aux témoignages
alter table public.testimonials
  add column if not exists media_type text not null default 'text',
  add column if not exists media_urls text[] not null default '{}',
  add column if not exists status text not null default 'approved',
  add column if not exists submitted_by text not null default 'admin';

update public.testimonials set status = 'approved' where status is null;
