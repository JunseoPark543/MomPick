-- 저장소 확장 3단계: 관리자·입점업체(판매자) 역할
-- 적용: 맨 위 폴더에서 `npm run db:push`, 그다음 `npm run db:types`
--
-- 원칙
-- - 계정 체계는 하나(Supabase Auth). 역할은 admin_users / seller_members 표로 구분한다.
-- - API 요청은 모두 'authenticated' 역할로 들어오므로, 칸(column) 단위 권한만으로는 관리자와 회원을 나눌 수 없다.
--   그래서 "관리자만 바꿀 수 있는 칸"은 트리거로 막고(guard), 관리자가 바꾼 내용은 트리거로 기록(admin_actions)한다.
-- - 서버 함수(security definer, 소유자 postgres)가 바꾸는 경우(좋아요로 베스트 선정, 신고 누적 숨김 등)는 막지 않는다.

-- ─────────────────────────────────────────────
-- 1. 관리자
-- ─────────────────────────────────────────────
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- 지금 로그인한 사람이 관리자인지
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 회원·브라우저에서 직접 바꾼 요청인지 (서버 함수 안에서 바뀐 경우는 false)
create function public.is_api_request()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user in ('authenticated', 'anon');
$$;

alter table public.admin_users enable row level security;
-- 내가 관리자인지는 나도 볼 수 있고, 명단 전체는 관리자만. 추가·삭제는 DB 에서만(앱·웹 불가)
create policy "관리자 명단 보기" on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

-- 관리자 작업 기록 (지우거나 고칠 수 없음)
create table public.admin_actions (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,                 -- INSERT / UPDATE / DELETE
  target_table text not null,
  target_id text,
  detail jsonb not null default '{}',   -- {"old": ..., "new": ...}
  created_at timestamptz not null default now()
);

create index admin_actions_created_idx on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;
create policy "관리자만 작업 기록 보기" on public.admin_actions for select to authenticated
  using ((select public.is_admin()));
revoke all on public.admin_actions from anon, authenticated;
grant select on public.admin_actions to authenticated;

-- 관리자가 화면에서 바꾼 내용을 자동 기록하는 트리거 함수
create function public.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if public.is_api_request() and public.is_admin() then
    insert into public.admin_actions (admin_id, action, target_table, target_id, detail)
    values (
      auth.uid(), tg_op, tg_table_name,
      coalesce(rec ->> 'id', rec ->> 'key', rec ->> 'level', rec ->> 'code'),
      jsonb_build_object(
        'old', case when tg_op = 'INSERT' then null else to_jsonb(old) end,
        'new', case when tg_op = 'DELETE' then null else to_jsonb(new) end
      )
    );
  end if;
  return null;
end;
$$;

-- ─────────────────────────────────────────────
-- 2. 입점업체(판매자)
-- ─────────────────────────────────────────────
create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 40),
  description text not null default '' check (char_length(description) <= 500),
  -- pending 심사 중 / active 활동 / suspended 정지 / rejected 반려 (관리자만 바꿈)
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 업체 연락처는 공개하지 않으므로 표를 나눈다
create table public.seller_contacts (
  seller_id uuid primary key references public.sellers (id) on delete cascade,
  contact_email text not null check (char_length(contact_email) between 3 and 100),
  contact_phone text not null check (char_length(contact_phone) between 8 and 20),
  business_number text check (char_length(business_number) <= 20)   -- 사업자등록번호 (데모: 선택)
);

create table public.seller_members (
  seller_id uuid not null references public.sellers (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (seller_id, user_id)
);

create index seller_members_user_idx on public.seller_members (user_id);

-- 이 업체의 담당자인지 / 활동 중인 업체의 담당자인지 / 대표인지
create function public.is_seller_member(p_seller uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.seller_members where seller_id = p_seller and user_id = auth.uid());
$$;

create function public.is_active_seller_member(p_seller uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.seller_members m join public.sellers s on s.id = m.seller_id
    where m.seller_id = p_seller and m.user_id = auth.uid() and s.status = 'active'
  );
$$;

create function public.is_seller_owner(p_seller uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.seller_members where seller_id = p_seller and user_id = auth.uid() and role = 'owner'
  );
$$;

revoke execute on function public.is_seller_member(uuid) from public, anon;
revoke execute on function public.is_active_seller_member(uuid) from public, anon;
revoke execute on function public.is_seller_owner(uuid) from public, anon;
grant execute on function public.is_seller_member(uuid) to authenticated;
grant execute on function public.is_active_seller_member(uuid) to authenticated;
grant execute on function public.is_seller_owner(uuid) to authenticated;

alter table public.sellers enable row level security;
alter table public.seller_contacts enable row level security;
alter table public.seller_members enable row level security;

-- 활동 중인 업체 이름은 누구나(상품에 표시). 심사 중·정지 업체는 그 업체 사람과 관리자만
create policy "비회원은 활동 업체 보기" on public.sellers for select to anon using (status = 'active');
create policy "회원은 업체 보기" on public.sellers for select to authenticated
  using (status = 'active' or (select public.is_seller_member(id)) or (select public.is_admin()));
-- 업체 소개는 대표가, 상태(승인·정지)는 관리자가 고친다 (상태는 아래 트리거가 관리자만 허용)
create policy "대표·관리자가 업체 수정" on public.sellers for update to authenticated
  using ((select public.is_seller_owner(id)) or (select public.is_admin()))
  with check ((select public.is_seller_owner(id)) or (select public.is_admin()));

create policy "업체 사람·관리자만 연락처 보기" on public.seller_contacts for select to authenticated
  using ((select public.is_seller_member(seller_id)) or (select public.is_admin()));
create policy "대표·관리자가 연락처 수정" on public.seller_contacts for update to authenticated
  using ((select public.is_seller_owner(seller_id)) or (select public.is_admin()))
  with check ((select public.is_seller_owner(seller_id)) or (select public.is_admin()));

create policy "업체 담당자 명단 보기" on public.seller_members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_seller_member(seller_id)) or (select public.is_admin()));

revoke all on public.sellers from anon, authenticated;
revoke all on public.seller_contacts from anon, authenticated;
revoke all on public.seller_members from anon, authenticated;
grant select on public.sellers to anon, authenticated;
grant update (name, description, status) on public.sellers to authenticated;
grant select on public.seller_contacts to authenticated;
grant update (contact_email, contact_phone, business_number) on public.seller_contacts to authenticated;
grant select on public.seller_members to authenticated;

-- 업체 상태는 관리자만 바꾸고, 바뀐 시각을 남긴다
create function public.guard_seller_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if public.is_api_request() and not public.is_admin() then
      raise exception '업체 승인·정지는 관리자만 할 수 있어요';
    end if;
    new.reviewed_at = now();
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger sellers_guard before update on public.sellers
  for each row execute function public.guard_seller_update();
create trigger sellers_log after insert or update or delete on public.sellers
  for each row execute function public.log_admin_change();

-- 입점 신청: 업체(심사 중) + 연락처 + 신청자를 대표로 등록
create function public.apply_seller(
  p_name text,
  p_description text,
  p_contact_email text,
  p_contact_phone text,
  p_business_number text
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
  if exists (
    select 1 from public.seller_members m join public.sellers s on s.id = m.seller_id
    where m.user_id = uid and s.status = 'pending'
  ) then
    raise exception '이미 심사 중인 입점 신청이 있어요';
  end if;

  insert into public.sellers (name, description) values (trim(p_name), coalesce(trim(p_description), ''))
  returning id into new_id;
  insert into public.seller_contacts (seller_id, contact_email, contact_phone, business_number)
  values (new_id, trim(p_contact_email), trim(p_contact_phone), nullif(trim(coalesce(p_business_number, '')), ''));
  insert into public.seller_members (seller_id, user_id, role) values (new_id, uid, 'owner');
  return new_id;
exception
  when unique_violation then raise exception '이미 같은 이름의 업체가 있어요';
end;
$$;

revoke execute on function public.apply_seller(text, text, text, text, text) from public, anon;
grant execute on function public.apply_seller(text, text, text, text, text) to authenticated;

-- ─────────────────────────────────────────────
-- 3. 상품을 업체에 연결
-- ─────────────────────────────────────────────
-- 기존 데모 상품의 판매처 이름으로 업체를 만들고(활동 상태) 연결한다
insert into public.sellers (name, description, status, reviewed_at)
select distinct seller_name, '데모 입점업체', 'active', now() from public.products
on conflict (name) do nothing;

insert into public.seller_contacts (seller_id, contact_email, contact_phone)
select s.id, 'demo@mompick-demo.dev', '010-0000-0000' from public.sellers s
where not exists (select 1 from public.seller_contacts c where c.seller_id = s.id);

alter table public.products add column seller_id uuid references public.sellers (id);
update public.products p set seller_id = s.id from public.sellers s where s.name = p.seller_name;
alter table public.products alter column seller_id set not null;
create index products_seller_idx on public.products (seller_id);

comment on column public.products.seller_name is '더 이상 쓰지 않음 — sellers.name 을 쓴다 (이전 버전 앱 호환용으로만 남김)';

-- 정지된 업체의 상품은 안 보이게, 업체 사람·관리자는 판매 중이 아닌 상품도 보이게
drop policy "누구나 판매 중인 상품 보기" on public.products;
create policy "누구나 판매 중인 상품 보기" on public.products for select to anon, authenticated
  using (is_active and exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'active'));
create policy "업체 사람·관리자는 모든 상품 보기" on public.products for select to authenticated
  using ((select public.is_seller_member(seller_id)) or (select public.is_admin()));

create policy "활동 업체 담당자·관리자가 상품 등록" on public.products for insert to authenticated
  with check ((select public.is_active_seller_member(seller_id)) or (select public.is_admin()));
create policy "활동 업체 담당자·관리자가 상품 수정" on public.products for update to authenticated
  using ((select public.is_active_seller_member(seller_id)) or (select public.is_admin()))
  with check ((select public.is_active_seller_member(seller_id)) or (select public.is_admin()));

grant insert (seller_id, name, description, category, price, original_price, image_url, icon, tint, delivery_label,
              stock, is_deal, deal_opens_at, deal_ends_at, early_access, subscribable, is_active, sort_order)
  on public.products to authenticated;
grant update (name, description, category, price, original_price, image_url, icon, tint, delivery_label,
              stock, is_deal, deal_opens_at, deal_ends_at, early_access, subscribable, is_active, sort_order,
              rating, review_count)
  on public.products to authenticated;

-- 판매자는 특가 가격·기간까지만. 선구매(나무 맘 먼저)·노출 순서·평점·업체 변경은 관리자만
create function public.guard_product_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_api_request() and not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.early_access or new.sort_order <> 0 or new.rating <> 0 or new.review_count <> 0 then
        raise exception '선구매 지정·노출 순서·평점은 관리자만 정할 수 있어요';
      end if;
    elsif new.early_access is distinct from old.early_access
       or new.sort_order is distinct from old.sort_order
       or new.rating is distinct from old.rating
       or new.review_count is distinct from old.review_count
       or new.seller_id is distinct from old.seller_id then
      raise exception '선구매 지정·노출 순서·평점은 관리자만 바꿀 수 있어요';
    end if;
  end if;
  -- 이전 버전 앱 호환: 판매처 이름을 업체 이름으로 맞춘다
  select s.name into new.seller_name from public.sellers s where s.id = new.seller_id;
  return new;
end;
$$;

create trigger products_guard before insert or update on public.products
  for each row execute function public.guard_product_change();
create trigger products_log after insert or update or delete on public.products
  for each row execute function public.log_admin_change();

-- 상품 사진 저장소: 누구나 보고, 업체 담당자는 자기 업체 폴더(업체 id)에만 올리고 지운다
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create function public.can_manage_product_folder(folder text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then return true; end if;
  return public.is_active_seller_member(folder::uuid);
exception
  when invalid_text_representation then return false;
end;
$$;

revoke execute on function public.can_manage_product_folder(text) from public, anon;
grant execute on function public.can_manage_product_folder(text) to authenticated;

create policy "업체 담당자가 상품 사진 올리기" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.can_manage_product_folder((storage.foldername(name))[1]));
create policy "업체 담당자가 상품 사진 지우기" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.can_manage_product_folder((storage.foldername(name))[1]));

-- ─────────────────────────────────────────────
-- 4. 주문을 업체별로 처리 (배송 상태)
-- ─────────────────────────────────────────────
alter table public.order_items
  add column seller_id uuid references public.sellers (id),
  -- paid 결제 완료 / preparing 상품 준비 / shipped 배송 중 / delivered 배송 완료 / cancelled 취소
  add column fulfillment_status text not null default 'paid'
    check (fulfillment_status in ('paid', 'preparing', 'shipped', 'delivered', 'cancelled')),
  add column tracking_number text check (char_length(tracking_number) <= 40),
  add column shipped_at timestamptz;

update public.order_items oi set seller_id = p.seller_id from public.products p where p.id = oi.product_id;
alter table public.order_items alter column seller_id set not null;
create index order_items_seller_idx on public.order_items (seller_id, fulfillment_status);

-- 주문 상품의 업체는 서버가 상품에서 채운다
create function public.set_order_item_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.seller_id into new.seller_id from public.products p where p.id = new.product_id;
  return new;
end;
$$;

create trigger order_items_set_seller before insert on public.order_items
  for each row execute function public.set_order_item_seller();

-- 이 주문에 내 업체 상품이 있는지 (정책끼리 서로 부르며 무한 반복되지 않게 서버 함수로)
create function public.is_order_seller(p_order uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.order_items oi
    join public.seller_members m on m.seller_id = oi.seller_id
    where oi.order_id = p_order and m.user_id = auth.uid()
  );
$$;

revoke execute on function public.is_order_seller(uuid) from public, anon;
grant execute on function public.is_order_seller(uuid) to authenticated;

-- 판매자는 자기 상품이 든 주문(배송지 포함)만, 관리자는 전부
create policy "판매자·관리자 주문 보기" on public.orders for select to authenticated
  using ((select public.is_order_seller(id)) or (select public.is_admin()));
create policy "판매자·관리자 주문 상품 보기" on public.order_items for select to authenticated
  using ((select public.is_seller_member(seller_id)) or (select public.is_admin()));
-- 배송 처리는 그 업체 담당자와 관리자만 (구매자는 수정 정책이 없어 못 바꿈)
create policy "판매자·관리자 배송 처리" on public.order_items for update to authenticated
  using ((select public.is_seller_member(seller_id)) or (select public.is_admin()))
  with check ((select public.is_seller_member(seller_id)) or (select public.is_admin()));
grant update (fulfillment_status, tracking_number, shipped_at) on public.order_items to authenticated;

create trigger order_items_log after update on public.order_items
  for each row execute function public.log_admin_change();

-- 판매자는 자기 상품의 정기 구독(배송지 포함)을, 관리자는 전부 본다
create policy "판매자·관리자 구독 보기" on public.subscriptions for select to authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.products p where p.id = product_id and (select public.is_seller_member(p.seller_id)))
  );

-- 정지된 업체 상품은 주문할 수 없게 주문 함수에 확인을 더한다 (나머지는 그대로)
create or replace function public.place_order(
  p_items jsonb,
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
    select pr.* into p from public.products pr
    join public.sellers s on s.id = pr.seller_id and s.status = 'active'
    where pr.id = (item ->> 'product_id')::uuid and pr.is_active
    for update of pr;
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

-- 업체 부담 쿠폰이면 어느 업체인지
alter table public.coupon_templates add column seller_id uuid references public.sellers (id);

-- ─────────────────────────────────────────────
-- 5. 관리자 권한: 커뮤니티·중고 관리
--    숨김·팩트 체크·베스트는 관리자만 (서버 함수가 하는 자동 처리는 그대로)
-- ─────────────────────────────────────────────
create policy "관리자는 모든 글 보기" on public.posts for select to authenticated using ((select public.is_admin()));
create policy "관리자가 글 관리" on public.posts for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (is_hidden, fact_check_status, best_at) on public.posts to authenticated;

create function public.guard_post_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_api_request() and not public.is_admin() and (
       new.is_hidden is distinct from old.is_hidden
    or new.fact_check_status is distinct from old.fact_check_status
    or new.best_at is distinct from old.best_at) then
    raise exception '숨김·팩트 체크·베스트는 관리자만 바꿀 수 있어요';
  end if;
  return new;
end;
$$;

create trigger posts_guard_moderation before update on public.posts
  for each row execute function public.guard_post_moderation();
create trigger posts_log after update on public.posts
  for each row execute function public.log_admin_change();

create policy "관리자는 모든 댓글 보기" on public.comments for select to authenticated using ((select public.is_admin()));
-- 댓글은 회원 수정 정책이 없으므로 이 정책을 통과하는 사람은 관리자뿐
create policy "관리자가 댓글 숨김" on public.comments for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (is_hidden) on public.comments to authenticated;
create trigger comments_log after update on public.comments
  for each row execute function public.log_admin_change();

create policy "관리자는 모든 매물 보기" on public.used_items for select to authenticated using ((select public.is_admin()));
create policy "관리자가 매물 관리" on public.used_items for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (is_hidden) on public.used_items to authenticated;

create function public.guard_used_item_moderation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_api_request() and not public.is_admin() and new.is_hidden is distinct from old.is_hidden then
    raise exception '매물 숨김은 관리자만 바꿀 수 있어요';
  end if;
  return new;
end;
$$;

create trigger used_items_guard_moderation before update on public.used_items
  for each row execute function public.guard_used_item_moderation();
create trigger used_items_log after update on public.used_items
  for each row execute function public.log_admin_change();

-- 신고 처리
create policy "관리자는 모든 신고 보기" on public.reports for select to authenticated using ((select public.is_admin()));
create policy "관리자가 신고 처리" on public.reports for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (status) on public.reports to authenticated;
create trigger reports_log after update on public.reports
  for each row execute function public.log_admin_change();

-- 신고된 채팅방만 관리자가 볼 수 있다 (그 외 채팅은 당사자만)
create policy "관리자는 신고된 채팅방 보기" on public.chat_rooms for select to authenticated
  using ((select public.is_admin()) and exists (select 1 from public.reports r where r.chat_room_id = id));
create policy "관리자는 신고된 채팅 보기" on public.chat_messages for select to authenticated
  using ((select public.is_admin()) and exists (select 1 from public.reports r where r.chat_room_id = room_id));

-- ─────────────────────────────────────────────
-- 6. 관리자 권한: 운영 (살균·주문·쿠폰·설정·등급)
-- ─────────────────────────────────────────────
create policy "관리자는 모든 살균 신청 보기" on public.sterilization_requests for select to authenticated
  using ((select public.is_admin()));
create policy "관리자가 살균 상태 변경" on public.sterilization_requests for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (status) on public.sterilization_requests to authenticated;
create trigger sterilization_log after update on public.sterilization_requests
  for each row execute function public.log_admin_change();

create policy "관리자는 모든 숲 맘 특권 신청 보기" on public.perk_entries for select to authenticated
  using ((select public.is_admin()));
create policy "관리자는 모든 쿠폰 지급 내역 보기" on public.user_coupons for select to authenticated
  using ((select public.is_admin()));

-- 설정값·등급 규칙·쿠폰 종류·배지: 관리자만 추가·수정·삭제 (회원은 원래 읽기만)
create policy "관리자가 설정 수정" on public.app_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (value, description) on public.app_settings to authenticated;
create trigger app_settings_log after update on public.app_settings
  for each row execute function public.log_admin_change();

create policy "관리자가 등급 규칙 수정" on public.grade_levels for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant update (name, emoji, description, rule) on public.grade_levels to authenticated;
create trigger grade_levels_log after update on public.grade_levels
  for each row execute function public.log_admin_change();

create policy "관리자가 쿠폰 종류 추가" on public.coupon_templates for insert to authenticated
  with check ((select public.is_admin()));
create policy "관리자가 쿠폰 종류 수정" on public.coupon_templates for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant insert, update on public.coupon_templates to authenticated;
create trigger coupon_templates_log after insert or update on public.coupon_templates
  for each row execute function public.log_admin_change();

create policy "관리자가 배지 추가" on public.badges for insert to authenticated
  with check ((select public.is_admin()));
create policy "관리자가 배지 수정" on public.badges for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
grant insert, update on public.badges to authenticated;
create trigger badges_log after insert or update on public.badges
  for each row execute function public.log_admin_change();
