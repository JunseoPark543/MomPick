-- 2단계: 회원 프로필, 아이 정보, 동네 목록
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

-- ─────────────────────────────────────────────
-- 1. 동네 목록 (행정동, 동 단위까지만)
-- ─────────────────────────────────────────────
create table public.neighborhoods (
  code text primary key,          -- 행정동 코드 10자리
  sido text not null,             -- 시/도
  sigungu text not null,          -- 시/군/구
  dong text not null              -- 동
);

alter table public.neighborhoods enable row level security;

-- 누구나 읽기만 가능 (추가·수정은 대시보드에서만)
create policy "누구나 동네 목록 읽기"
  on public.neighborhoods for select
  to anon, authenticated
  using (true);

revoke all on public.neighborhoods from anon, authenticated;
grant select on public.neighborhoods to anon, authenticated;

-- ─────────────────────────────────────────────
-- 2. 회원 프로필 (가입하면 자동으로 한 줄 생성)
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text unique check (char_length(nickname) between 2 and 12),
  neighborhood_code text references public.neighborhoods (code),
  adult_confirmed_at timestamptz not null,   -- 만 19세 이상 보호자 확인 시각
  terms_agreed_at timestamptz not null,      -- 약관·개인정보 동의 시각
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 닉네임·동네는 커뮤니티에 보여야 하므로 로그인한 회원끼리 읽기 가능
create policy "로그인 회원은 프로필 읽기"
  on public.profiles for select
  to authenticated
  using (true);

-- 본인 프로필만 수정
create policy "본인 프로필만 수정"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 수정은 닉네임·동네만 가능 (동의 시각 등은 못 바꿈)
-- 생성은 아래 트리거가, 삭제는 회원 탈퇴(auth.users 삭제)가 처리한다
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nickname, neighborhood_code) on public.profiles to authenticated;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 회원가입 시 프로필 자동 생성.
-- 앱의 가입 양식에서 보낸 성인 확인·약관 동의가 없으면 가입 자체를 막는다.
-- (대시보드에서 테스트 회원을 만들 때도 user metadata 에
--  {"adult_confirmed": true, "terms_agreed": true} 를 넣어야 한다)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce((new.raw_user_meta_data ->> 'adult_confirmed')::boolean, false) is not true
     or coalesce((new.raw_user_meta_data ->> 'terms_agreed')::boolean, false) is not true then
    raise exception '만 19세 이상 보호자 확인과 약관 동의가 필요합니다';
  end if;

  insert into public.profiles (id, adult_confirmed_at, terms_agreed_at)
  values (new.id, now(), now());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 3. 아이 정보 (출생 연월만. 이름·사진·건강 정보는 받지 않음)
-- ─────────────────────────────────────────────
create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  birth_month date not null check (extract(day from birth_month) = 1),  -- 항상 1일로 저장
  created_at timestamptz not null default now()
);

create index children_parent_id_idx on public.children (parent_id);

alter table public.children enable row level security;

-- 본인 아이 정보만 읽기·추가·수정·삭제
create policy "본인 아이 정보 읽기"
  on public.children for select
  to authenticated
  using (parent_id = (select auth.uid()));

create policy "본인 아이 정보 추가"
  on public.children for insert
  to authenticated
  with check (parent_id = (select auth.uid()));

create policy "본인 아이 정보 수정"
  on public.children for update
  to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

create policy "본인 아이 정보 삭제"
  on public.children for delete
  to authenticated
  using (parent_id = (select auth.uid()));

revoke all on public.children from anon, authenticated;
grant select, insert, update, delete on public.children to authenticated;
