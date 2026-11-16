-- 신고 등록 권한 회귀 검사: 본인 글 신고는 차단되어야 한다.
-- 실제 데이터를 남기지 않도록 트랜잭션을 항상 롤백한다.
-- npx supabase db query --remote --file scripts/check-report-insert-rls.sql --yes
begin;

select set_config(
  'request.jwt.claims',
  '{"sub":"dbbad599-6215-463f-b0b4-5ac735dded33","role":"authenticated"}',
  true
);
set local role authenticated;

do $$
declare
  v_own_post_id uuid;
begin
  select p.id into v_own_post_id
  from public.posts p
  where p.author_id = (select auth.uid())
    and p.is_hidden = false
  order by p.created_at
  limit 1;

  if v_own_post_id is null then
    raise exception '검사 계정의 공개 글이 필요합니다';
  end if;

  begin
    insert into public.reports (reporter_id, post_id, reason)
    values ((select auth.uid()), v_own_post_id, 'other');

    raise exception '본인 글 신고가 허용되었습니다';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

select true as self_report_blocked;
rollback;
