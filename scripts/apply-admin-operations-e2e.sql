-- 관리자 운영 화면의 1단계 시험: 팩트 체크·베스트·살균 수거 예정 처리.
-- 시험 데이터는 cleanup-admin-operations-e2e.sql 로 지운다.
-- npx supabase db query --remote --file scripts/apply-admin-operations-e2e.sql --yes
begin;

do $$
declare
  v_admin_id uuid := (select user_id from public.admin_users order by created_at limit 1);
begin
  if v_admin_id is null then
    raise exception '관리자 계정이 필요해요';
  end if;
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', v_admin_id, 'role', 'authenticated')::text,
    true
  );
end;
$$;

set local role authenticated;

do $$
begin
  if not public.is_admin() then
    raise exception '관리자 요청 설정 실패';
  end if;

  update public.posts
  set fact_check_status = 'checked', best_at = now()
  where id = '03f0d590-ba6a-4c77-a23f-c34f62821274'
    and fact_check_status is null and best_at is null;
  if not found then
    raise exception '시험 게시글의 원래 상태가 아니에요';
  end if;

  update public.sterilization_requests
  set status = 'scheduled'
  where id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21'
    and status = 'requested';
  if not found then
    raise exception '시험 살균 신청의 원래 상태가 아니에요';
  end if;

  if not exists (
    select 1 from public.admin_actions
    where target_table = 'posts'
      and target_id = '03f0d590-ba6a-4c77-a23f-c34f62821274'
      and detail->'new'->>'fact_check_status' = 'checked'
      and detail->'new'->>'best_at' is not null
  ) or not exists (
    select 1 from public.admin_actions
    where target_table = 'sterilization_requests'
      and target_id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21'
      and detail->'new'->>'status' = 'scheduled'
  ) then
    raise exception '관리자 작업 기록이 남지 않았어요';
  end if;
end;
$$;

commit;

select
  (select fact_check_status from public.posts where id = '03f0d590-ba6a-4c77-a23f-c34f62821274') as fact_check_status,
  (select best_at is not null from public.posts where id = '03f0d590-ba6a-4c77-a23f-c34f62821274') as is_best,
  (select status from public.sterilization_requests where id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21') as sterilization_status;
