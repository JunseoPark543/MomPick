-- 3단계-1: 커뮤니티 글
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  board text not null check (board in ('local', 'cohort')),           -- 동네 게시판 / 동기 모임
  category text not null check (category in ('question', 'info', 'daily', 'recommend')),
  title text not null check (char_length(title) between 1 and 60),
  body text not null check (char_length(body) between 1 and 3000),

  -- 아래 값은 서버가 글쓴이 정보로 채운다 (앱에서 보낼 수 없음)
  neighborhood_code text not null references public.neighborhoods (code),
  cohort_month date,                                  -- 동기 모임 글이면 글쓴이 아이의 출생 연월
  like_count integer not null default 0,
  comment_count integer not null default 0,
  best_at timestamptz,                                -- 베스트 글로 선정된 시각
  fact_check_status text check (fact_check_status in ('checked', 'caution')),  -- 운영자가 표시
  is_hidden boolean not null default false,           -- 신고 누적 등으로 숨김

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint posts_cohort_month_check check ((board = 'cohort') = (cohort_month is not null))
);

create index posts_board_created_idx on public.posts (board, created_at desc);
create index posts_neighborhood_idx on public.posts (neighborhood_code, created_at desc);
create index posts_cohort_idx on public.posts (cohort_month, created_at desc);
create index posts_author_idx on public.posts (author_id);

-- 글을 쓸 때 글쓴이의 동네와 아이 출생 연월을 서버에서 채운다
create function public.set_post_context()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select p.neighborhood_code into new.neighborhood_code
  from public.profiles p
  where p.id = new.author_id;

  if new.neighborhood_code is null then
    raise exception '동네를 먼저 설정해 주세요';
  end if;

  if new.board = 'cohort' then
    select c.birth_month into new.cohort_month
    from public.children c
    where c.parent_id = new.author_id
    order by c.created_at
    limit 1;

    if new.cohort_month is null then
      raise exception '아이 출생 연월을 먼저 설정해 주세요';
    end if;
  else
    new.cohort_month = null;
  end if;

  return new;
end;
$$;

create trigger posts_set_context
  before insert on public.posts
  for each row execute function public.set_post_context();

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- 로그인 회원은 숨김 처리되지 않은 글을 읽을 수 있다 (내 글은 숨겨져도 보임)
create policy "로그인 회원은 글 읽기"
  on public.posts for select
  to authenticated
  using (is_hidden = false or author_id = (select auth.uid()));

-- 본인 이름으로만 글쓰기
create policy "본인 이름으로 글쓰기"
  on public.posts for insert
  to authenticated
  with check (author_id = (select auth.uid()));

-- 본인 글만 수정·삭제
create policy "본인 글만 수정"
  on public.posts for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "본인 글만 삭제"
  on public.posts for delete
  to authenticated
  using (author_id = (select auth.uid()));

-- 앱에서 정할 수 있는 칸은 게시판·말머리·제목·내용뿐이다
-- (좋아요 수, 베스트, 팩트 체크, 숨김은 서버나 운영자만 바꾼다)
revoke all on public.posts from anon, authenticated;
grant select, delete on public.posts to authenticated;
grant insert (board, category, title, body) on public.posts to authenticated;
grant update (category, title, body) on public.posts to authenticated;
