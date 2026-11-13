-- 4단계: 중고거래 (매물, 사진, 1:1 채팅, 거래 완료)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.

-- ─────────────────────────────────────────────
-- 1. 매물
-- ─────────────────────────────────────────────
create table public.used_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  description text not null default '' check (char_length(description) <= 2000),
  category text not null check (category in ('stroller', 'carseat', 'carrier', 'toy', 'clothes', 'feeding', 'book', 'etc')),
  price integer not null check (price between 0 and 100000000),        -- 0 이면 나눔
  condition text not null check (condition in ('new', 'like_new', 'good', 'used')),
  size text check (char_length(size) <= 30),                           -- 사이즈 (예: 80, 신생아용)
  usage_period text check (char_length(usage_period) <= 30),           -- 사용 기간 (예: 6개월)
  safe_pay_available boolean not null default true,                    -- 안전결제 가능 여부 (직거래는 항상 가능)
  image_paths text[] not null check (cardinality(image_paths) between 1 and 10),  -- Storage 경로
  status text not null default 'selling' check (status in ('selling', 'reserved', 'sold')),

  -- 아래 값은 서버가 채운다 (앱에서 보낼 수 없음)
  neighborhood_code text not null references public.neighborhoods (code),
  chat_count integer not null default 0,
  buyer_id uuid references public.profiles (id) on delete set null,   -- 거래 완료 시 구매자
  trade_method text check (trade_method in ('direct', 'safe')),        -- 거래 완료 시 방식
  sold_at timestamptz,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index used_items_created_idx on public.used_items (created_at desc);
create index used_items_neighborhood_idx on public.used_items (neighborhood_code, created_at desc);
create index used_items_seller_idx on public.used_items (seller_id);
create index used_items_buyer_idx on public.used_items (buyer_id);

-- 판매자의 동네를 서버에서 채운다
create function public.set_used_item_context()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select p.neighborhood_code into new.neighborhood_code
  from public.profiles p
  where p.id = new.seller_id;

  if new.neighborhood_code is null then
    raise exception '동네를 먼저 설정해 주세요';
  end if;
  return new;
end;
$$;

create trigger used_items_set_context
  before insert on public.used_items
  for each row execute function public.set_used_item_context();

create trigger used_items_set_updated_at
  before update on public.used_items
  for each row execute function public.set_updated_at();

alter table public.used_items enable row level security;

-- 누구나(비회원 포함) 숨김 아닌 매물을 볼 수 있다. 판매자는 자기 매물이 숨겨져도 보인다.
create policy "누구나 매물 보기"
  on public.used_items for select
  to anon, authenticated
  using (is_hidden = false or seller_id = (select auth.uid()));

create policy "본인 이름으로 매물 등록"
  on public.used_items for insert
  to authenticated
  with check (seller_id = (select auth.uid()));

-- 거래 완료된 매물은 고칠 수 없다
create policy "본인 매물만 수정"
  on public.used_items for update
  to authenticated
  using (seller_id = (select auth.uid()) and status <> 'sold')
  with check (seller_id = (select auth.uid()) and status <> 'sold');

create policy "본인 매물만 삭제"
  on public.used_items for delete
  to authenticated
  using (seller_id = (select auth.uid()));

-- 거래 완료(sold)는 아래 complete_used_trade 함수로만 한다
revoke all on public.used_items from anon, authenticated;
grant select on public.used_items to anon, authenticated;
grant delete on public.used_items to authenticated;
grant insert (title, description, category, price, condition, size, usage_period, safe_pay_available, image_paths)
  on public.used_items to authenticated;
grant update (title, description, category, price, condition, size, usage_period, safe_pay_available, image_paths, status)
  on public.used_items to authenticated;

-- ─────────────────────────────────────────────
-- 2. 매물 사진 저장소 (Storage)
--    누구나 사진을 볼 수 있고, 회원은 자기 폴더(회원 id)에만 올리고 지울 수 있다
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('used-images', 'used-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "회원은 자기 폴더에 매물 사진 올리기"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'used-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "회원은 자기 매물 사진 지우기"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'used-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ─────────────────────────────────────────────
-- 3. 1:1 채팅방 (매물 하나 × 구매 희망자 한 명)
-- ─────────────────────────────────────────────
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.used_items (id) on delete cascade,
  buyer_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,  -- 서버가 채움
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (item_id, buyer_id)
);

create index chat_rooms_buyer_idx on public.chat_rooms (buyer_id, last_message_at desc);
create index chat_rooms_seller_idx on public.chat_rooms (seller_id, last_message_at desc);

-- 채팅방을 만들 때 판매자를 서버에서 채우고, 매물의 채팅 수를 올린다
create function public.set_chat_room_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select i.seller_id into new.seller_id
  from public.used_items i
  where i.id = new.item_id;

  if new.seller_id is null then
    raise exception '매물을 찾을 수 없어요';
  end if;
  if new.seller_id = new.buyer_id then
    raise exception '내 매물에는 채팅할 수 없어요';
  end if;

  update public.used_items set chat_count = chat_count + 1 where id = new.item_id;
  return new;
end;
$$;

create trigger chat_rooms_set_seller
  before insert on public.chat_rooms
  for each row execute function public.set_chat_room_seller();

alter table public.chat_rooms enable row level security;

-- 채팅방은 구매자와 판매자만 볼 수 있다
create policy "참여자만 채팅방 보기"
  on public.chat_rooms for select
  to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));

-- 판매 중·예약 중인 남의 매물에만 채팅 시작
create policy "구매 희망자가 채팅 시작"
  on public.chat_rooms for insert
  to authenticated
  with check (
    buyer_id = (select auth.uid())
    and exists (
      select 1 from public.used_items i
      where i.id = item_id and i.status <> 'sold' and i.seller_id <> (select auth.uid())
    )
  );

revoke all on public.chat_rooms from anon, authenticated;
grant select on public.chat_rooms to authenticated;
grant insert (item_id) on public.chat_rooms to authenticated;

-- ─────────────────────────────────────────────
-- 4. 채팅 메시지
-- ─────────────────────────────────────────────
create table public.chat_messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.chat_rooms (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index chat_messages_room_idx on public.chat_messages (room_id, id);

alter table public.chat_messages enable row level security;

create policy "참여자만 메시지 보기"
  on public.chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_rooms r
      where r.id = room_id and (select auth.uid()) in (r.buyer_id, r.seller_id)
    )
  );

create policy "참여자만 메시지 보내기"
  on public.chat_messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.chat_rooms r
      where r.id = room_id and (select auth.uid()) in (r.buyer_id, r.seller_id)
    )
  );

revoke all on public.chat_messages from anon, authenticated;
grant select on public.chat_messages to authenticated;
grant insert (room_id, body) on public.chat_messages to authenticated;

-- 채팅 목록에 보여줄 마지막 메시지를 채팅방에 기록
create function public.update_chat_room_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.chat_rooms
  set last_message = left(new.body, 100), last_message_at = new.created_at
  where id = new.room_id;
  return null;
end;
$$;

create trigger chat_messages_update_room
  after insert on public.chat_messages
  for each row execute function public.update_chat_room_last_message();

-- 실시간 채팅: 새 메시지를 앱에 바로 보내준다 (위 RLS 규칙이 그대로 적용됨)
alter publication supabase_realtime add table public.chat_messages;

-- ─────────────────────────────────────────────
-- 5. 거래 완료 (판매자만, 채팅한 구매자 중 한 명을 지정)
--    데모에서 안전결제는 가짜 결제로 처리하고 방식만 기록한다
-- ─────────────────────────────────────────────
create function public.complete_used_trade(p_room_id uuid, p_method text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  room public.chat_rooms;
begin
  if p_method not in ('direct', 'safe') then
    raise exception '거래 방식이 올바르지 않아요';
  end if;

  select * into room from public.chat_rooms where id = p_room_id;
  if room.id is null or room.seller_id <> (select auth.uid()) then
    raise exception '판매자만 거래를 완료할 수 있어요';
  end if;

  update public.used_items
  set status = 'sold', buyer_id = room.buyer_id, trade_method = p_method, sold_at = now()
  where id = room.item_id and status <> 'sold'
    and (p_method = 'direct' or safe_pay_available);

  if not found then
    raise exception '이미 거래가 끝났거나 안전결제를 받지 않는 매물이에요';
  end if;
end;
$$;

revoke execute on function public.complete_used_trade(uuid, text) from public, anon;
grant execute on function public.complete_used_trade(uuid, text) to authenticated;

-- ─────────────────────────────────────────────
-- 6. 안전결제 수수료 설정 (등급별 할인은 7단계에서)
-- ─────────────────────────────────────────────
insert into public.app_settings (key, value, description) values
  ('used_safe_pay_fee_rate', '0.035', '중고 안전결제 수수료율 (0.035 = 3.5%). 직거래는 무료');
