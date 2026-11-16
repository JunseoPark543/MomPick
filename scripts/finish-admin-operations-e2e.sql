-- 관리자 운영 화면의 2단계 시험: 신고 확인·글 숨김·살균 완료 처리.
-- npx supabase db query --remote --file scripts/finish-admin-operations-e2e.sql --yes
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
  set is_hidden = true
  where id = '03f0d590-ba6a-4c77-a23f-c34f62821274'
    and is_hidden = false;
  if not found then
    raise exception '시험 게시글을 숨기지 못했어요';
  end if;

  update public.reports
  set status = 'reviewed'
  where id = 'bfb96922-5b5f-4a02-a1fd-4c3d77ea42e4'
    and status = 'pending';
  if not found then
    raise exception '시험 신고를 확인 처리하지 못했어요';
  end if;

  update public.sterilization_requests
  set status = 'done'
  where id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21'
    and status = 'scheduled';
  if not found then
    raise exception '시험 살균 신청을 완료 처리하지 못했어요';
  end if;

  if not exists (
    select 1 from public.admin_actions
    where target_table = 'posts'
      and target_id = '03f0d590-ba6a-4c77-a23f-c34f62821274'
      and detail->'new'->>'is_hidden' = 'true'
  ) or not exists (
    select 1 from public.admin_actions
    where target_table = 'reports'
      and target_id = 'bfb96922-5b5f-4a02-a1fd-4c3d77ea42e4'
      and detail->'new'->>'status' = 'reviewed'
  ) or not exists (
    select 1 from public.admin_actions
    where target_table = 'sterilization_requests'
      and target_id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21'
      and detail->'new'->>'status' = 'done'
  ) then
    raise exception '관리자 작업 기록이 남지 않았어요';
  end if;
end;
$$;

commit;

select
  (select is_hidden from public.posts where id = '03f0d590-ba6a-4c77-a23f-c34f62821274') as post_hidden,
  (select status from public.reports where id = 'bfb96922-5b5f-4a02-a1fd-4c3d77ea42e4') as report_status,
  (select status from public.sterilization_requests where id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21') as sterilization_status;
