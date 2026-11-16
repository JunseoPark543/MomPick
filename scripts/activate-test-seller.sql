-- 판매자·주문 흐름을 시험하기 전에만 실행한다.
-- 검증용 테스트 업체의 상태를 활동으로 바꾸고, 관리자 작업 기록도 남긴다.
-- 실행 전 운영 DB 변경임을 사용자에게 알린다.
-- npx supabase db query --remote --file scripts/activate-test-seller.sql --yes
begin;

do $$
declare
  admin_id uuid := (select user_id from public.admin_users order by created_at limit 1);
  seller_id uuid := (select id from public.sellers where name = '검증용 테스트 업체' order by created_at limit 1);
begin
  if admin_id is null or seller_id is null then
    raise exception '관리자 계정과 검증용 테스트 업체가 필요해요';
  end if;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
end;
$$;

set local role authenticated;
update public.sellers
set status = 'active'
where name = '검증용 테스트 업체' and status <> 'active';
commit;

select
  s.status,
  exists (
    select 1 from public.admin_actions a
    where a.target_table = 'sellers'
      and a.target_id = s.id::text
      and a.detail->'new'->>'status' = 'active'
  ) as activation_logged
from public.sellers s
where s.name = '검증용 테스트 업체';
