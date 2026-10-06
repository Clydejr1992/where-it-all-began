-- WHERE IT ALL BEGAN - NEW ADMIN SYSTEM

alter table public.stories add column if not exists excerpt text;
alter table public.stories add column if not exists featured_image_url text;
alter table public.stories add column if not exists published_at timestamptz;

create table if not exists public.videos (
    id uuid primary key default gen_random_uuid(),
    author_id uuid references public.profiles(id) on delete set null,
    title text not null,
    description text,
    category text,
    topics text[],
    video_url text not null,
    thumbnail_url text,
    status text not null default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    published_at timestamptz
);

alter table public.videos enable row level security;

drop policy if exists "Anyone can view published videos" on public.videos;
create policy "Anyone can view published videos"
on public.videos for select
using (status = 'published');

drop policy if exists "Admins can view all videos" on public.videos;
create policy "Admins can view all videos"
on public.videos for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert videos" on public.videos;
create policy "Admins can insert videos"
on public.videos for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update videos" on public.videos;
create policy "Admins can update videos"
on public.videos for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete videos" on public.videos;
create policy "Admins can delete videos"
on public.videos for delete to authenticated
using (public.is_admin());

drop policy if exists "Admins can view all stories" on public.stories;
create policy "Admins can view all stories"
on public.stories for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert stories" on public.stories;
create policy "Admins can insert stories"
on public.stories for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update stories" on public.stories;
create policy "Admins can update stories"
on public.stories for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete stories" on public.stories;
create policy "Admins can delete stories"
on public.stories for delete to authenticated
using (public.is_admin());

drop policy if exists "Anyone can view published stories" on public.stories;
create policy "Anyone can view published stories"
on public.stories for select
using (status = 'published');

insert into storage.buckets (id, name, public)
values ('story-videos', 'story-videos', true)
on conflict (id) do update set public = true;

drop policy if exists "Admins can upload story videos" on storage.objects;
create policy "Admins can upload story videos"
on storage.objects for insert to authenticated
with check (bucket_id = 'story-videos' and public.is_admin());

drop policy if exists "Admins can update story videos" on storage.objects;
create policy "Admins can update story videos"
on storage.objects for update to authenticated
using (bucket_id = 'story-videos' and public.is_admin())
with check (bucket_id = 'story-videos' and public.is_admin());

drop policy if exists "Admins can delete story videos" on storage.objects;
create policy "Admins can delete story videos"
on storage.objects for delete to authenticated
using (bucket_id = 'story-videos' and public.is_admin());

drop policy if exists "Anyone can watch story videos" on storage.objects;
create policy "Anyone can watch story videos"
on storage.objects for select
using (bucket_id = 'story-videos');
