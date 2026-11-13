-- 로그인 없이 둘러보기: 비회원(anon)도 글·댓글·닉네임을 읽을 수 있게 한다
-- 쓰기·좋아요·신고는 여전히 로그인 회원만 가능하다.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

-- 숨김 처리되지 않은 글
create policy "비회원은 숨김 아닌 글 읽기"
  on public.posts for select
  to anon
  using (is_hidden = false);

grant select on public.posts to anon;

-- 숨김 처리되지 않은 댓글 (볼 수 있는 글의 댓글만)
create policy "비회원은 숨김 아닌 댓글 읽기"
  on public.comments for select
  to anon
  using (
    is_hidden = false
    and exists (select 1 from public.posts p where p.id = post_id)
  );

grant select on public.comments to anon;

-- 글쓴이 닉네임과 동네만 (동의 시각 등 다른 칸은 비회원에게 안 보임)
create policy "비회원은 닉네임 읽기"
  on public.profiles for select
  to anon
  using (true);

grant select (id, nickname, neighborhood_code) on public.profiles to anon;
