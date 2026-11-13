-- 3단계-3: 운영 설정값, 베스트 글 자동 선정, 신고와 자동 숨김
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

-- ─────────────────────────────────────────────
-- 1. 운영 설정값 (숫자를 코드에 박지 않고 여기서 바꾼다)
--    Table Editor → app_settings 에서 value 를 고치면 바로 적용된다
-- ─────────────────────────────────────────────
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  description text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- 로그인 회원은 읽기만 (수정은 대시보드에서만)
create policy "로그인 회원은 설정 읽기"
  on public.app_settings for select
  to authenticated
  using (true);

revoke all on public.app_settings from anon, authenticated;
grant select on public.app_settings to authenticated;

create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

insert into public.app_settings (key, value, description) values
  ('best_post_min_likes', '10', '좋아요가 이 개수 이상이면 베스트 글로 자동 선정'),
  ('report_hide_threshold', '3', '서로 다른 회원 이 수만큼 신고하면 글·댓글 자동 숨김');

-- 설정값(정수)을 읽는 도우미
create function public.setting_int(setting_key text, fallback integer)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select (value #>> '{}')::integer from public.app_settings where key = setting_key), fallback);
$$;

-- 서버 내부(트리거)에서만 쓴다. 앱에서 직접 부를 수 없게 막는다.
revoke execute on function public.setting_int(text, integer) from public, anon, authenticated;

-- ─────────────────────────────────────────────
-- 2. 베스트 글 자동 선정 (좋아요 수 반영 함수를 교체)
--    한 번 선정되면 좋아요가 줄어도 유지된다. 운영자는 best_at 을 비워 취소할 수 있다.
-- ─────────────────────────────────────────────
create or replace function public.update_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts
    set like_count = like_count + 1,
        best_at = case
          when best_at is null and like_count + 1 >= public.setting_int('best_post_min_likes', 10) then now()
          else best_at
        end
    where id = new.post_id;
  else
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

create index posts_best_idx on public.posts (best_at desc) where best_at is not null;

-- ─────────────────────────────────────────────
-- 3. 신고
-- ─────────────────────────────────────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'privacy', 'misinfo', 'other')),
  detail text check (char_length(detail) <= 500),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),  -- 운영자 처리 상태
  created_at timestamptz not null default now(),

  -- 글 또는 댓글 중 정확히 하나를 신고한다
  constraint reports_one_target check ((post_id is null) <> (comment_id is null))
);

-- 같은 사람이 같은 글·댓글을 두 번 신고할 수 없다
create unique index reports_unique_post on public.reports (reporter_id, post_id) where post_id is not null;
create unique index reports_unique_comment on public.reports (reporter_id, comment_id) where comment_id is not null;
create index reports_status_idx on public.reports (status, created_at desc);

alter table public.reports enable row level security;

-- 내가 한 신고만 보인다 (누가 신고했는지는 다른 회원에게 비공개)
create policy "내 신고만 읽기"
  on public.reports for select
  to authenticated
  using (reporter_id = (select auth.uid()));

-- 볼 수 있는 남의 글·댓글만 신고할 수 있다
create policy "남의 글·댓글 신고"
  on public.reports for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and (
      exists (
        select 1 from public.posts p
        where p.id = post_id and p.author_id <> (select auth.uid())
      )
      or exists (
        select 1 from public.comments c
        where c.id = comment_id and c.author_id <> (select auth.uid())
      )
    )
  );

revoke all on public.reports from anon, authenticated;
grant select on public.reports to authenticated;
grant insert (post_id, comment_id, reason, detail) on public.reports to authenticated;

-- 신고가 기준 수 이상 모이면 자동으로 숨긴다 (운영자가 확인 후 is_hidden 을 풀 수 있다)
create function public.hide_reported_content()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  threshold integer := public.setting_int('report_hide_threshold', 3);
begin
  if new.post_id is not null then
    if (select count(*) from public.reports where post_id = new.post_id) >= threshold then
      update public.posts set is_hidden = true where id = new.post_id;
    end if;
  else
    if (select count(*) from public.reports where comment_id = new.comment_id) >= threshold then
      update public.comments set is_hidden = true where id = new.comment_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger reports_auto_hide
  after insert on public.reports
  for each row execute function public.hide_reported_content();
