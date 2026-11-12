-- 3단계-2: 댓글(팩트 체크 근거 댓글 포함)과 좋아요
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

-- ─────────────────────────────────────────────
-- 1. 댓글
-- ─────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  is_fact_check boolean not null default false,       -- 팩트 체크 근거 댓글인지 (숲 맘 '기여'로 집계)
  source text check (char_length(source) between 2 and 300),  -- 근거 출처 (링크, 기관·책 이름 등)
  is_hidden boolean not null default false,           -- 신고 누적 등으로 숨김
  created_at timestamptz not null default now(),

  constraint comments_fact_check_source check (not is_fact_check or source is not null)
);

create index comments_post_idx on public.comments (post_id, created_at);
create index comments_author_idx on public.comments (author_id);

alter table public.comments enable row level security;

-- 볼 수 있는 글의 댓글만 읽기 (숨겨진 댓글은 쓴 사람만)
create policy "볼 수 있는 글의 댓글 읽기"
  on public.comments for select
  to authenticated
  using (
    (is_hidden = false or author_id = (select auth.uid()))
    and exists (select 1 from public.posts p where p.id = post_id)
  );

-- 본인 이름으로, 볼 수 있는 글에만 댓글 쓰기
create policy "본인 이름으로 댓글 쓰기"
  on public.comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.posts p where p.id = post_id)
  );

-- 본인 댓글만 삭제 (수정은 지원하지 않음)
create policy "본인 댓글만 삭제"
  on public.comments for delete
  to authenticated
  using (author_id = (select auth.uid()));

revoke all on public.comments from anon, authenticated;
grant select, delete on public.comments to authenticated;
grant insert (post_id, body, is_fact_check, source) on public.comments to authenticated;

-- 댓글 수를 글에 자동 반영 (회원은 posts.comment_count 를 직접 못 바꾸므로 security definer)
create function public.update_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  else
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger comments_count
  after insert or delete on public.comments
  for each row execute function public.update_post_comment_count();

-- ─────────────────────────────────────────────
-- 2. 좋아요
-- ─────────────────────────────────────────────
create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_likes_user_idx on public.post_likes (user_id);

alter table public.post_likes enable row level security;

-- 내가 누른 좋아요만 보인다 (누가 눌렀는지는 공개하지 않음, 개수는 posts.like_count)
create policy "내 좋아요만 읽기"
  on public.post_likes for select
  to authenticated
  using (user_id = (select auth.uid()));

-- 볼 수 있는 남의 글에만 좋아요 (내 글에는 못 누름)
create policy "남의 글에 좋아요"
  on public.post_likes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id <> (select auth.uid())
    )
  );

create policy "내 좋아요 취소"
  on public.post_likes for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.post_likes from anon, authenticated;
grant select, delete on public.post_likes to authenticated;
grant insert (post_id) on public.post_likes to authenticated;

-- 좋아요 수를 글에 자동 반영
create function public.update_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  else
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger post_likes_count
  after insert or delete on public.post_likes
  for each row execute function public.update_post_like_count();
