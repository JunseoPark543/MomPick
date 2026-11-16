-- 관리자 작업 기록 회귀 검사. 관리자 1명과 '검증용 테스트 업체' 대표 계정이 필요하다.
-- 실행 전 운영 DB 검사임을 사용자에게 알릴 것. 업체 상태·설정값은 바꾸지 않는다.
-- 모든 시험 변경과 기록은 마지막 ROLLBACK 으로 되돌린다(기록 번호에는 공백이 생길 수 있음).
-- npx supabase db query --remote --file scripts/check-admin-actions.sql --yes
begin;

do $$
declare
  admin_id uuid := (select user_id from public.admin_users order by created_at limit 1);
  seller_id uuid;
  member_id uuid;
begin
  select s.id, m.user_id into seller_id, member_id
  from public.sellers s
  join public.seller_members m on m.seller_id = s.id and m.role = 'owner'
  where s.name = '검증용 테스트 업체'
    and not exists (select 1 from public.admin_users a where a.user_id = m.user_id)
  order by s.created_at limit 1;
  if admin_id is null or member_id is null then
    raise exception '관리자와 검증용 테스트 업체의 일반 대표 계정이 필요해요';
  end if;
  perform set_config('mompick.test_seller_id', seller_id::text, true);
  perform set_config('mompick.test_member_id', member_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
end;
$$;

set local role authenticated;
do $$
declare
  test_id text := current_setting('mompick.test_seller_id');
  entry public.admin_actions%rowtype;
begin
  if not public.is_admin() then raise exception '관리자 요청 설정 실패'; end if;

  update public.sellers set description = 'mompick-admin-audit-check' where id = test_id::uuid;
  if not found then raise exception '관리자 업체 수정 실패'; end if;
  select * into strict entry from public.admin_actions
  where admin_id = auth.uid() and target_table = 'sellers' and target_id = test_id
    and created_at = current_timestamp and detail->'new'->>'description' = 'mompick-admin-audit-check';
  if entry.action <> 'UPDATE' or entry.detail->'old' is null
    or entry.detail->'old'->>'status' is distinct from entry.detail->'new'->>'status' then
    raise exception '관리자 변경 전후 기록 오류';
  end if;

  update public.app_settings set description = 'mompick-settings-audit-check' where key = 'best_post_min_likes';
  if not found then raise exception '관리자 설정 수정 실패'; end if;
  select * into strict entry from public.admin_actions
  where admin_id = auth.uid() and target_table = 'app_settings' and target_id = 'best_post_min_likes'
    and created_at = current_timestamp and detail->'new'->>'description' = 'mompick-settings-audit-check';
  if entry.detail->'old'->'value' is distinct from entry.detail->'new'->'value' then
    raise exception '시험 중 운영 설정값이 변경됨';
  end if;

  if has_function_privilege('authenticated', 'public.log_admin_change()', 'EXECUTE')
    or has_function_privilege('anon', 'public.log_admin_change()', 'EXECUTE')
    or has_table_privilege(current_user, 'public.admin_actions', 'INSERT,UPDATE,DELETE') then
    raise exception '작업 기록 직접 실행·위조 권한이 열려 있음';
  end if;
end;
$$;

reset role;
do $$
begin
  perform set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('mompick.test_member_id'), 'role', 'authenticated')::text, true);
end;
$$;
set local role authenticated;
do $$
begin
  if public.is_admin() then raise exception '일반 회원 요청 설정 실패'; end if;
  update public.sellers set description = 'mompick-member-audit-check'
  where id = current_setting('mompick.test_seller_id')::uuid;
  if not found then raise exception '일반 대표의 자기 업체 소개 수정 실패'; end if;
  if exists (select 1 from public.admin_actions) then
    raise exception '일반 회원에게 관리자 기록이 보임';
  end if;
  begin
    update public.sellers set status = case when status = 'active' then 'suspended' else 'active' end
    where id = current_setting('mompick.test_seller_id')::uuid;
    raise exception '일반 회원의 업체 상태 변경이 허용됨';
  exception when raise_exception then
    if sqlerrm <> '업체 승인·정지는 관리자만 할 수 있어요' then raise; end if;
  end;
end;
$$;

reset role;
do $$
begin
  if exists (select 1 from public.admin_actions where detail->'new'->>'description' = 'mompick-member-audit-check') then
    raise exception '일반 회원의 변경이 관리자 기록으로 남음';
  end if;
end;
$$;

rollback;
select '관리자 기록·변경 전후 값·일반 회원 권한 검사 통과, 시험 변경 전체 원복' as result;
