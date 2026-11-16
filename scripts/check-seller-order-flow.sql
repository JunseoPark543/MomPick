-- 판매자·구매자 주문 흐름이 끝난 뒤, 관리자 권한으로 결과를 읽을 수 있는지 검사한다.
-- 데이터를 바꾸지 않으며 마지막 ROLLBACK 으로 요청 역할도 원래대로 돌린다.
-- npx supabase db query --remote --file scripts/check-seller-order-flow.sql --yes
begin;

do $$
declare
  admin_id uuid := (select user_id from public.admin_users order by created_at limit 1);
begin
  if admin_id is null then
    raise exception '관리자 계정이 필요해요';
  end if;
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', admin_id, 'role', 'authenticated')::text,
    true
  );
end;
$$;

set local role authenticated;

do $$
declare
  test_order public.orders%rowtype;
  test_item public.order_items%rowtype;
  test_product public.products%rowtype;
begin
  if not public.is_admin() then
    raise exception '관리자 요청 설정 실패';
  end if;

  select o.* into strict test_order
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  join public.products p on p.id = oi.product_id
  where p.name like 'e2e-seller-flow-%'
  order by o.created_at desc
  limit 1;

  select oi.* into strict test_item
  from public.order_items oi
  where oi.order_id = test_order.id;

  select p.* into strict test_product
  from public.products p
  where p.id = test_item.product_id;

  if test_order.status <> 'paid'
    or test_item.fulfillment_status <> 'delivered'
    or test_item.tracking_number <> 'E2E-20261116-001'
    or test_product.stock <> 1 then
    raise exception '주문·배송 결과가 기대값과 달라요';
  end if;

  if not exists (
    select 1 from public.admin_actions a
    where a.target_table = 'sellers'
      and a.target_id = test_product.seller_id::text
      and a.detail->'new'->>'status' = 'active'
  ) then
    raise exception '관리자 업체 활동 처리 기록을 읽지 못했어요';
  end if;
end;
$$;

rollback;
select '관리자 권한으로 테스트 주문·배송·업체 작업 기록 조회 통과' as result;
