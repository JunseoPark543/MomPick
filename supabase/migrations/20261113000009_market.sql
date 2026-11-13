-- 5단계: 마켓 특가, 주문(가짜 결제), 정기 구독, 숲 맘 특권 신청
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.
-- (먼저 20261113000008_grades_coupons.sql 을 실행해야 한다)

-- ─────────────────────────────────────────────
-- 1. 상품 (상품 등록·수정은 대시보드 Table Editor 에서)
-- ─────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null check (category in ('babyfood', 'snack', 'diaper', 'wipes', 'formula', 'bath', 'toy', 'etc')),
  seller_name text not null default '맘픽',          -- 입점업체 이름
  price integer not null check (price >= 0),
  original_price integer not null,
  image_url text,                                   -- 비워두면 앱이 아이콘으로 대신 보여줌
  icon text not null default 'cube-outline',
  tint text not null default '#F3ECE6',
  rating numeric(2, 1) not null default 0,          -- 데모 표시용 (후기 기능 전)
  review_count integer not null default 0,
  delivery_label text not null default '무료배송',
  stock integer not null default 100 check (stock >= 0),
  is_deal boolean not null default false,           -- 오늘의 특가
  deal_opens_at timestamptz,                        -- 특가 오픈 시각 (오픈런)
  deal_ends_at timestamptz,
  early_access boolean not null default false,      -- 나무 맘 이상 먼저 구매
  subscribable boolean not null default false,      -- 정기 구독 가능
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint products_original_price_check check (original_price >= price)
);

create index products_list_idx on public.products (is_active, sort_order, created_at desc);

alter table public.products enable row level security;
create policy "누구나 판매 중인 상품 보기" on public.products for select to anon, authenticated using (is_active);
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;

-- 데모 상품. 오픈런 시연이 필요하면 아래처럼 오픈 시각을 다시 맞추면 된다:
--   update public.products set deal_opens_at = now() + interval '20 minutes',
--     deal_ends_at = now() + interval '1 day' where early_access;
insert into public.products
  (name, description, category, seller_name, price, original_price, icon, tint, rating, review_count, delivery_label,
   is_deal, deal_opens_at, deal_ends_at, early_access, subscribable, sort_order)
values
  ('유기농 한우 진밥 이유식 중기 7팩', '국내산 유기농 쌀과 한우로 만든 중기(7~9개월) 진밥 이유식이에요. 냉동 배송.', 'babyfood', '맘픽 이유식 공방',
   25900, 34900, 'restaurant-outline', '#FDE7E8', 4.8, 1284, '내일 도착',
   true, now() + interval '20 minutes', now() + interval '2 days', true, true, 1),
  ('프리미엄 밴드형 기저귀 4단계 3팩', '흡수력이 좋은 밴드형 기저귀. 4단계(9~14kg).', 'diaper', '맘픽 셀렉트',
   39900, 52000, 'layers-outline', '#E6F0FB', 4.7, 3921, '내일 도착',
   true, now() - interval '1 hour', now() + interval '2 days', false, true, 2),
  ('무향 아기 물티슈 캡형 100매 10팩', '무향·무알코올 캡형 물티슈.', 'wipes', '맘픽 셀렉트',
   12900, 19800, 'water-outline', '#E3F5F5', 4.9, 8710, '무료배송',
   true, now() - interval '1 hour', now() + interval '2 days', false, true, 3),
  ('쌀떡뻥 아기과자 6종 세트', '첨가물 없는 쌀과자 6종.', 'snack', '맘픽 이유식 공방',
   9900, 13500, 'ice-cream-outline', '#FFF3DB', 4.6, 562, '내일 도착',
   true, now() + interval '20 minutes', now() + interval '2 days', true, false, 4),
  ('젖병 세정제 500ml 2개', '식물 유래 세정 성분.', 'bath', '맘픽 셀렉트',
   11800, 15600, 'flask-outline', '#EEF6E8', 4.7, 1033, '무료배송',
   false, null, null, false, false, 5),
  ('아기 바스 & 샴푸 올인원 400ml', '순한 약산성 올인원.', 'bath', '맘픽 셀렉트',
   14500, 21000, 'sparkles-outline', '#F1EAFB', 4.8, 2210, '내일 도착',
   false, null, null, false, false, 6),
  ('소고기 채소 이유식 후기 7팩', '후기(10~12개월) 이유식.', 'babyfood', '맘픽 이유식 공방',
   27900, 32900, 'restaurant-outline', '#FDECE2', 4.9, 845, '내일 도착',
   false, null, null, false, true, 7),
  ('원목 촉감 블록 20pcs', '모서리를 둥글게 다듬은 원목 블록.', 'toy', '맘픽 셀렉트',
   23000, 29000, 'cube-outline', '#FFF3DB', 4.5, 312, '무료배송',
   false, null, null, false, false, 8);

-- ─────────────────────────────────────────────
-- 2. 주문 (데모: 실제 결제 없이 '결제 완료'로 저장)
--    정확한 주소는 주문할 때만 받아 주문에만 저장한다
-- ─────────────────────────────────────────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'paid' check (status in ('paid', 'cancelled')),
  items_total integer not null,
  shipping_fee integer not null,
  discount integer not null default 0,
  total integer not null,
  coupon_id uuid references public.user_coupons (id),
  recipient_name text not null,
  recipient_phone text not null,
  address text not null,
  address_detail text not null default '',
  memo text not null default '',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  product_name text not null,
  unit_price integer not null,
  quantity integer not null check (quantity between 1 and 99)
);

create index order_items_order_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "내 주문 보기" on public.orders for select to authenticated using (user_id = (select auth.uid()));
create policy "내 주문 상품 보기" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));

-- 주문은 place_order 함수로만 만든다 (가격·재고·쿠폰을 서버에서 계산)
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- 특가를 지금 살 수 있는지 (오픈런: 등급이 높으면 오픈 몇 분 전부터)
create function public.deal_open_for(p public.products, member_level integer)
returns boolean
language sql
stable
set search_path = ''
as $$
  select not p.is_deal or (
    (p.deal_ends_at is null or now() < p.deal_ends_at)
    and (
      p.deal_opens_at is null
      or now() >= p.deal_opens_at - case
        when p.early_access and member_level >= public.setting_int('early_access_min_level', 3)
        then make_interval(mins => public.setting_int('early_access_minutes', 30))
        else interval '0'
      end
    )
  );
$$;

revoke execute on function public.deal_open_for(public.products, integer) from public, anon, authenticated;

create function public.place_order(
  p_items jsonb,                -- [{"product_id": "...", "quantity": 1}, ...]
  p_coupon_id uuid,
  p_recipient_name text,
  p_recipient_phone text,
  p_address text,
  p_address_detail text,
  p_memo text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  lvl integer;
  item jsonb;
  p public.products;
  qty integer;
  v_items_total integer := 0;
  v_shipping integer;
  v_disc integer := 0;
  coupon public.coupon_templates;
  new_order uuid := gen_random_uuid();
begin
  if uid is null then raise exception '로그인이 필요해요'; end if;
  if coalesce(trim(p_recipient_name), '') = '' or coalesce(trim(p_recipient_phone), '') = ''
     or coalesce(trim(p_address), '') = '' then
    raise exception '받는 분, 연락처, 주소를 입력해 주세요';
  end if;
  if jsonb_array_length(p_items) = 0 then raise exception '상품을 골라 주세요'; end if;

  lvl := public.member_level(uid);

  insert into public.orders (id, user_id, items_total, shipping_fee, total, recipient_name, recipient_phone,
                             address, address_detail, memo)
  values (new_order, uid, 0, 0, 0, trim(p_recipient_name), trim(p_recipient_phone), trim(p_address),
          coalesce(trim(p_address_detail), ''), coalesce(trim(p_memo), ''));

  for item in select * from jsonb_array_elements(p_items) loop
    qty := (item ->> 'quantity')::integer;
    select * into p from public.products where id = (item ->> 'product_id')::uuid and is_active for update;
    if p.id is null then raise exception '판매가 끝난 상품이 있어요'; end if;
    if qty is null or qty < 1 or qty > 99 then raise exception '수량을 확인해 주세요'; end if;
    if p.stock < qty then raise exception '% 재고가 부족해요', p.name; end if;
    if not public.deal_open_for(p, lvl) then
      raise exception '% 은(는) 아직 구매할 수 없는 특가예요', p.name;
    end if;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
    values (new_order, p.id, p.name, p.price, qty);
    update public.products set stock = stock - qty where id = p.id;
    v_items_total := v_items_total + p.price * qty;
  end loop;

  v_shipping := case when v_items_total >= public.setting_int('market_free_shipping_min', 30000) then 0
                   else public.setting_int('market_shipping_fee', 3000) end;

  if p_coupon_id is not null then
    coupon := public.use_coupon(uid, p_coupon_id, array['market_amount', 'market_free_shipping'], 'order:' || new_order);
    if coupon.kind = 'market_free_shipping' then
      v_disc := v_shipping;
    else
      if v_items_total < coupon.min_order then
        raise exception '이 쿠폰은 %원 이상 주문할 때 쓸 수 있어요', coupon.min_order;
      end if;
      v_disc := least(coupon.value, v_items_total);
    end if;
  end if;

  update public.orders
  set items_total = v_items_total, shipping_fee = v_shipping, discount = v_disc,
      total = v_items_total + v_shipping - v_disc, coupon_id = p_coupon_id
  where id = new_order;

  return new_order;
end;
$$;

revoke execute on function public.place_order(jsonb, uuid, text, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, uuid, text, text, text, text, text) to authenticated;

-- ─────────────────────────────────────────────
-- 3. 정기 구독 (데모: 실제 정기 결제·배송 연동 없음)
-- ─────────────────────────────────────────────
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id),
  interval_weeks integer not null check (interval_weeks in (1, 2, 4)),
  quantity integer not null default 1 check (quantity between 1 and 10),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  next_delivery_date date not null,
  recipient_name text not null,
  recipient_phone text not null,
  address text not null,
  address_detail text not null default '',
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create index subscriptions_user_idx on public.subscriptions (user_id, status);

alter table public.subscriptions enable row level security;
create policy "내 구독 보기" on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;

create function public.subscribe_product(
  p_product_id uuid,
  p_interval_weeks integer,
  p_quantity integer,
  p_recipient_name text,
  p_recipient_phone text,
  p_address text,
  p_address_detail text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  new_id uuid;
begin
  if uid is null then raise exception '로그인이 필요해요'; end if;
  if not exists (select 1 from public.products where id = p_product_id and is_active and subscribable) then
    raise exception '정기 구독할 수 없는 상품이에요';
  end if;
  if exists (select 1 from public.subscriptions where user_id = uid and product_id = p_product_id and status = 'active') then
    raise exception '이미 구독 중인 상품이에요';
  end if;
  if coalesce(trim(p_recipient_name), '') = '' or coalesce(trim(p_recipient_phone), '') = ''
     or coalesce(trim(p_address), '') = '' then
    raise exception '받는 분, 연락처, 주소를 입력해 주세요';
  end if;

  insert into public.subscriptions (user_id, product_id, interval_weeks, quantity, next_delivery_date,
                                    recipient_name, recipient_phone, address, address_detail)
  values (uid, p_product_id, p_interval_weeks, coalesce(p_quantity, 1), current_date + 2,
          trim(p_recipient_name), trim(p_recipient_phone), trim(p_address), coalesce(trim(p_address_detail), ''))
  returning id into new_id;
  return new_id;
end;
$$;

revoke execute on function public.subscribe_product(uuid, integer, integer, text, text, text, text) from public, anon;
grant execute on function public.subscribe_product(uuid, integer, integer, text, text, text, text) to authenticated;

create function public.cancel_subscription(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.subscriptions set status = 'cancelled', cancelled_at = now()
  where id = p_id and user_id = auth.uid() and status = 'active';
$$;

revoke execute on function public.cancel_subscription(uuid) from public, anon;
grant execute on function public.cancel_subscription(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 4. 숲 맘 특권 신청 (데모: 추첨·발송은 운영자가 대시보드에서 처리)
-- ─────────────────────────────────────────────
create table public.perk_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  perk text not null check (perk in ('kidscafe_raffle', 'sample_box')),
  period text not null,                             -- 'YYYY-MM' (한 달에 한 번)
  created_at timestamptz not null default now(),
  unique (user_id, perk, period)
);

alter table public.perk_entries enable row level security;
create policy "내 특권 신청 보기" on public.perk_entries for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.perk_entries from anon, authenticated;
grant select on public.perk_entries to authenticated;

create function public.apply_perk(p_perk text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception '로그인이 필요해요'; end if;
  if public.member_level(uid) < public.setting_int('perk_min_level', 4) then
    raise exception '숲 맘부터 신청할 수 있어요';
  end if;
  insert into public.perk_entries (user_id, perk, period)
  values (uid, p_perk, to_char(now() at time zone 'Asia/Seoul', 'YYYY-MM'));
exception
  when unique_violation then raise exception '이번 달에는 이미 신청했어요';
end;
$$;

revoke execute on function public.apply_perk(text) from public, anon;
grant execute on function public.apply_perk(text) to authenticated;
