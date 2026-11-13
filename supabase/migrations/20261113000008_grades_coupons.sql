-- 7단계(기반): 맘 등급, 배지, 쿠폰
-- 등급 조건·쿠폰·배지 규칙은 모두 표에 데이터로 들어 있어 대시보드에서 바꿀 수 있다.
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

-- ─────────────────────────────────────────────
-- 1. 등급 규칙
--    rule 형식: {"all":[{"metric":"이름","min":숫자}, ...]} (모두 만족)
--              {"any":[...]} (하나만 만족)
--    metric 종류: profile_complete, food_orders, used_trades, sterilizations,
--                 best_posts, active_subscriptions, fact_checks
-- ─────────────────────────────────────────────
create table public.grade_levels (
  level integer primary key check (level between 1 and 10),
  name text not null,
  emoji text not null default '',
  description text not null,          -- 달성 조건 설명 (앱에 그대로 보여줌)
  rule jsonb not null
);

alter table public.grade_levels enable row level security;
create policy "누구나 등급 규칙 읽기" on public.grade_levels for select to anon, authenticated using (true);
revoke all on public.grade_levels from anon, authenticated;
grant select on public.grade_levels to anon, authenticated;

insert into public.grade_levels (level, name, emoji, description, rule) values
  (1, '씨앗 맘', '🌱', '가입 후 프로필·동네·아이 월령 설정',
   '{"all":[{"metric":"profile_complete","min":1}]}'),
  (2, '싹트 맘', '🌿', '이유식 첫 구매 또는 중고거래 1회 완료',
   '{"any":[{"metric":"food_orders","min":1},{"metric":"used_trades","min":1}]}'),
  (3, '나무 맘', '🌳', '살균 서비스 이용 그리고 커뮤니티 베스트 글 선정',
   '{"all":[{"metric":"sterilizations","min":1},{"metric":"best_posts","min":1}]}'),
  (4, '숲 맘', '🏞️', '정기 구독 유지 그리고 팩트 체크 기여',
   '{"all":[{"metric":"active_subscriptions","min":1},{"metric":"fact_checks","min":1}]}');

-- 규칙을 만족하는지 검사
create function public.grade_rule_met(rule jsonb, metrics jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when rule ? 'all' then not exists (
      select 1 from jsonb_array_elements(rule -> 'all') r
      where coalesce((metrics ->> (r ->> 'metric'))::integer, 0) < (r ->> 'min')::integer)
    when rule ? 'any' then exists (
      select 1 from jsonb_array_elements(rule -> 'any') r
      where coalesce((metrics ->> (r ->> 'metric'))::integer, 0) >= (r ->> 'min')::integer)
    else true
  end;
$$;

-- 회원 등급 (0 = 아직 시작하기 전). 회원은 직접 바꿀 수 없고 refresh_my_level 로만 오른다.
alter table public.profiles
  add column level integer not null default 0,
  add column level_updated_at timestamptz;

-- 커뮤니티 닉네임 옆에 등급을 보여줄 수 있게 비회원에게도 공개
grant select (level) on public.profiles to anon;

-- ─────────────────────────────────────────────
-- 2. 배지
-- ─────────────────────────────────────────────
create table public.badges (
  code text primary key,
  name text not null,
  emoji text not null default '',
  description text not null,
  rule jsonb not null
);

alter table public.badges enable row level security;
create policy "누구나 배지 목록 읽기" on public.badges for select to anon, authenticated using (true);
revoke all on public.badges from anon, authenticated;
grant select on public.badges to anon, authenticated;

insert into public.badges (code, name, emoji, description, rule) values
  ('safe_supporter', '안심 맘 서포터즈', '🛡️', '근거를 단 팩트 체크 댓글 3개 이상',
   '{"all":[{"metric":"fact_checks","min":3}]}'),
  ('best_writer', '베스트 글쓴이', '✍️', '베스트 글 1개 이상',
   '{"all":[{"metric":"best_posts","min":1}]}'),
  ('first_trade', '첫 나눔·거래', '🤝', '중고거래 1회 완료',
   '{"all":[{"metric":"used_trades","min":1}]}');

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_code text not null references public.badges (code) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

alter table public.user_badges enable row level security;
create policy "내 배지 읽기" on public.user_badges for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.user_badges from anon, authenticated;
grant select on public.user_badges to authenticated;

-- ─────────────────────────────────────────────
-- 3. 쿠폰
--    funded_by: 비용 부담 주체 (platform 플랫폼 / seller 입점업체 / shared 분담)
--    seller_share_pct: 입점업체 부담 비율(%)
-- ─────────────────────────────────────────────
create table public.coupon_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('market_amount', 'market_free_shipping', 'sterilization_percent', 'used_fee_percent')),
  value integer not null check (value >= 0),        -- 금액(원) 또는 할인율(%)
  min_order integer not null default 0,             -- 최소 주문 금액
  grant_level integer references public.grade_levels (level),  -- 이 등급이 되면 자동 지급
  valid_days integer not null default 30,
  funded_by text not null check (funded_by in ('platform', 'seller', 'shared')),
  seller_share_pct integer not null default 0 check (seller_share_pct between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupon_templates enable row level security;
create policy "누구나 쿠폰 종류 읽기" on public.coupon_templates for select to anon, authenticated using (true);
revoke all on public.coupon_templates from anon, authenticated;
grant select on public.coupon_templates to anon, authenticated;

insert into public.coupon_templates (name, kind, value, min_order, grant_level, valid_days, funded_by, seller_share_pct) values
  ('씨앗 맘 환영 3,000원 할인', 'market_amount', 3000, 20000, 1, 30, 'platform', 0),
  ('싹트 맘 이유식 무료배송', 'market_free_shipping', 0, 0, 2, 30, 'seller', 100),
  ('싹트 맘 살균 10% 할인', 'sterilization_percent', 10, 0, 2, 60, 'shared', 50),
  ('싹트 맘 안전결제 수수료 20% 할인', 'used_fee_percent', 20, 0, 2, 60, 'platform', 0),
  ('나무 맘 살균 15% 할인', 'sterilization_percent', 15, 0, 3, 60, 'shared', 50),
  ('나무 맘 무료배송', 'market_free_shipping', 0, 0, 3, 30, 'seller', 100),
  ('숲 맘 살균 20% 할인', 'sterilization_percent', 20, 0, 4, 60, 'shared', 50),
  ('숲 맘 5,000원 할인', 'market_amount', 5000, 30000, 4, 30, 'shared', 50);

create table public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid not null references public.coupon_templates (id),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_for text                                     -- 예: 'order:<id>', 'sterilization:<id>'
);

create index user_coupons_user_idx on public.user_coupons (user_id, used_at);

alter table public.user_coupons enable row level security;
create policy "내 쿠폰 읽기" on public.user_coupons for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.user_coupons from anon, authenticated;
grant select on public.user_coupons to authenticated;

-- 쿠폰 사용 처리 (서버 함수 안에서만 호출). 쓸 수 있는 쿠폰이면 템플릿을 돌려준다.
create function public.use_coupon(p_user uuid, p_coupon uuid, p_kinds text[], p_used_for text)
returns public.coupon_templates
language plpgsql
security definer
set search_path = ''
as $$
declare
  t public.coupon_templates;
begin
  select ct.* into t
  from public.user_coupons uc
  join public.coupon_templates ct on ct.id = uc.template_id
  where uc.id = p_coupon and uc.user_id = p_user and uc.used_at is null
    and uc.expires_at > now() and ct.kind = any (p_kinds)
  for update of uc;

  if t.id is null then
    raise exception '쓸 수 없는 쿠폰이에요';
  end if;

  update public.user_coupons set used_at = now(), used_for = p_used_for where id = p_coupon;
  return t;
end;
$$;

revoke execute on function public.use_coupon(uuid, uuid, text[], text) from public, anon, authenticated;

-- ─────────────────────────────────────────────
-- 4. 등급 계산
-- ─────────────────────────────────────────────
-- 회원 활동 숫자 모으기 (마켓·살균 표는 다음 SQL 파일에서 만든다)
create function public.member_metrics(uid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'profile_complete', (
      select case when p.nickname is not null and p.neighborhood_code is not null
        and exists (select 1 from public.children c where c.parent_id = uid) then 1 else 0 end
      from public.profiles p where p.id = uid),
    'food_orders', (
      select count(distinct o.id) from public.orders o
      join public.order_items oi on oi.order_id = o.id
      join public.products pr on pr.id = oi.product_id
      where o.user_id = uid and o.status = 'paid' and pr.category = 'babyfood'),
    'used_trades', (
      select count(*) from public.used_items i
      where i.status = 'sold' and (i.seller_id = uid or i.buyer_id = uid)),
    'sterilizations', (
      select count(*) from public.sterilization_requests s
      where s.user_id = uid and s.status <> 'cancelled'),
    'best_posts', (
      select count(*) from public.posts p where p.author_id = uid and p.best_at is not null),
    'active_subscriptions', (
      select count(*) from public.subscriptions s where s.user_id = uid and s.status = 'active'),
    'fact_checks', (
      select count(*) from public.comments c
      where c.author_id = uid and c.is_fact_check and not c.is_hidden)
  );
end;
$$;

revoke execute on function public.member_metrics(uuid) from public, anon, authenticated;

-- 내 등급 다시 계산: 올랐으면 저장하고 새 등급 쿠폰 지급, 배지도 확인한다.
-- 등급은 내려가지 않는다.
create function public.refresh_my_level()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  m jsonb;
  old_level integer;
  new_level integer := 0;
  g record;
begin
  if uid is null then
    raise exception '로그인이 필요해요';
  end if;

  m := public.member_metrics(uid);
  for g in select * from public.grade_levels order by level loop
    exit when not public.grade_rule_met(g.rule, m);
    new_level := g.level;
  end loop;

  select level into old_level from public.profiles where id = uid for update;
  new_level := greatest(new_level, old_level);

  if new_level > old_level then
    update public.profiles set level = new_level, level_updated_at = now() where id = uid;

    insert into public.user_coupons (user_id, template_id, expires_at)
    select uid, t.id, now() + make_interval(days => t.valid_days)
    from public.coupon_templates t
    where t.is_active and t.grant_level > old_level and t.grant_level <= new_level;
  end if;

  insert into public.user_badges (user_id, badge_code)
  select uid, b.code from public.badges b where public.grade_rule_met(b.rule, m)
  on conflict do nothing;

  return jsonb_build_object('level', new_level, 'previous_level', old_level, 'metrics', m);
end;
$$;

revoke execute on function public.refresh_my_level() from public, anon;
grant execute on function public.refresh_my_level() to authenticated;

-- 회원 등급 숫자 읽기 (서버 함수용)
create function public.member_level(uid uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select level from public.profiles where id = uid), 0);
$$;

revoke execute on function public.member_level(uuid) from public, anon, authenticated;

-- ─────────────────────────────────────────────
-- 5. 등급 혜택 관련 설정값
-- ─────────────────────────────────────────────
insert into public.app_settings (key, value, description) values
  ('early_access_min_level', '3', '이 등급 이상은 특가를 먼저 살 수 있음 (3 = 나무 맘)'),
  ('early_access_minutes', '30', '선구매(오픈런) 권한: 오픈 몇 분 전부터 살 수 있는지'),
  ('used_fee_discount_by_level', '{"1":0,"2":10,"3":20,"4":30}', '등급별 중고 안전결제 수수료 할인율(%)'),
  ('market_shipping_fee', '3000', '마켓 기본 배송비(원)'),
  ('market_free_shipping_min', '30000', '이 금액 이상 주문하면 무료배송(원)'),
  ('sterilization_price_per_item', '15000', '살균 서비스 품목당 가격(원)'),
  ('perk_min_level', '4', '키즈카페 추첨·샘플박스를 신청할 수 있는 등급 (4 = 숲 맘)');
