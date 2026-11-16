-- 판매자·구매자 한 바퀴 시험 뒤에만 실행한다.
-- 테스트 상품·주문·싹트 맘 쿠폰을 지우고 테스트 업체를 반려로 되돌린다.
-- 사진 파일은 이 스크립트 실행 전에 Storage API로 따로 지운다.
-- npx supabase db query --remote --file scripts/cleanup-seller-flow-test.sql --yes
begin;

do $$
declare
  v_admin_id uuid := (select user_id from public.admin_users order by created_at limit 1);
  v_seller_id uuid := (select id from public.sellers where name = '검증용 테스트 업체' order by created_at limit 1);
  v_buyer_id uuid := '80b79e5b-899f-426a-a3a1-a75034a61f8e';
  product_ids uuid[];
  order_ids uuid[];
  original_level_at timestamptz;
  level_two_coupon_count integer;
begin
  if v_admin_id is null or v_seller_id is null then
    raise exception '관리자 계정과 검증용 테스트 업체가 필요해요';
  end if;

  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', v_admin_id, 'role', 'authenticated')::text,
    true
  );

  select array_agg(p.id order by p.created_at), min(p.created_at)
    into product_ids, original_level_at
  from public.products p
  where p.seller_id = v_seller_id and p.name like 'e2e-seller-flow-%';

  -- 사진을 나중에 정리하려고 다시 실행하는 경우에는 상태만 반려로 되돌린다.
  if coalesce(cardinality(product_ids), 0) = 0 then
    return;
  end if;

  if cardinality(product_ids) <> 1 then
    raise exception '정리 대상 테스트 상품은 정확히 1개여야 해요';
  end if;

  select array_agg(distinct oi.order_id order by oi.order_id)
    into order_ids
  from public.order_items oi
  where oi.product_id = any(product_ids);

  if coalesce(cardinality(order_ids), 0) <> 1
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = any(order_ids) and oi.product_id <> all(product_ids)
    ) then
    raise exception '테스트 주문에 다른 상품이 섞여 있어 정리를 멈췄어요';
  end if;

  -- 첫 등급 쿠폰의 발급 시각은 시험 전 씨앗 맘 등급이 기록된 시각이다.
  select min(uc.issued_at) into original_level_at
  from public.user_coupons uc
  join public.coupon_templates ct on ct.id = uc.template_id
  where uc.user_id = v_buyer_id and ct.grant_level = 1;

  if original_level_at is null then
    raise exception '시험 전 등급 시각을 찾지 못했어요';
  end if;

  select count(*) into level_two_coupon_count
  from public.user_coupons uc
  join public.coupon_templates ct on ct.id = uc.template_id
  where uc.user_id = v_buyer_id
    and ct.grant_level = 2
    and uc.issued_at >= (select min(o.created_at) from public.orders o where o.id = any(order_ids));

  if level_two_coupon_count <> 3 then
    raise exception '시험으로 생긴 싹트 맘 쿠폰은 정확히 3개여야 해요';
  end if;

  delete from public.user_coupons uc
  using public.coupon_templates ct
  where uc.template_id = ct.id
    and uc.user_id = v_buyer_id
    and ct.grant_level = 2
    and uc.issued_at >= (select min(o.created_at) from public.orders o where o.id = any(order_ids));

  delete from public.orders where id = any(order_ids);
  delete from public.products where id = any(product_ids);
  update public.profiles
  set level = 1, level_updated_at = original_level_at
  where id = v_buyer_id and level = 2;

end;
$$;

set local role authenticated;
update public.sellers
set status = 'rejected'
where name = '검증용 테스트 업체' and status <> 'rejected';

commit;

select
  s.status,
  (select count(*) from public.products p where p.seller_id = s.id and p.name like 'e2e-seller-flow-%') as remaining_test_products,
  (select count(*) from public.orders o where o.user_id = '80b79e5b-899f-426a-a3a1-a75034a61f8e' and o.created_at >= '2026-11-16 14:43:00+00') as remaining_test_orders,
  (select level from public.profiles where id = '80b79e5b-899f-426a-a3a1-a75034a61f8e') as buyer_level
from public.sellers s
where s.name = '검증용 테스트 업체';
