-- 8단계: 차단, 매물·채팅 신고, 회원 탈퇴 / 7단계: 안전결제 수수료 등급 할인
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.
-- (08~10 SQL 파일을 먼저 실행해야 한다)

-- ─────────────────────────────────────────────
-- 1. 차단
-- ─────────────────────────────────────────────
create table public.blocks (
  blocker_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

-- 내 차단 목록만 보고, 추가·해제할 수 있다 (상대는 차단당한 사실을 모른다)
create policy "내 차단 목록 보기" on public.blocks for select to authenticated using (blocker_id = (select auth.uid()));
create policy "차단하기" on public.blocks for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "차단 해제" on public.blocks for delete to authenticated using (blocker_id = (select auth.uid()));

revoke all on public.blocks from anon, authenticated;
grant select, delete on public.blocks to authenticated;
grant insert (blocked_id) on public.blocks to authenticated;

-- 두 사람 사이에 (어느 쪽이든) 차단이 있는지 (서버 규칙용)
create function public.is_block_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

revoke execute on function public.is_block_between(uuid, uuid) from public, anon;
grant execute on function public.is_block_between(uuid, uuid) to authenticated;

-- 내가 차단한 사람의 글·댓글·매물은 나에게 안 보이게 읽기 규칙을 바꾼다
drop policy "로그인 회원은 글 읽기" on public.posts;
create policy "로그인 회원은 글 읽기"
  on public.posts for select
  to authenticated
  using (
    (is_hidden = false or author_id = (select auth.uid()))
    and not exists (select 1 from public.blocks b where b.blocker_id = (select auth.uid()) and b.blocked_id = author_id)
  );

drop policy "볼 수 있는 글의 댓글 읽기" on public.comments;
create policy "볼 수 있는 글의 댓글 읽기"
  on public.comments for select
  to authenticated
  using (
    (is_hidden = false or author_id = (select auth.uid()))
    and exists (select 1 from public.posts p where p.id = post_id)
    and not exists (select 1 from public.blocks b where b.blocker_id = (select auth.uid()) and b.blocked_id = author_id)
  );

drop policy "누구나 매물 보기" on public.used_items;
create policy "비회원은 숨김 아닌 매물 보기"
  on public.used_items for select
  to anon
  using (is_hidden = false);
create policy "회원은 매물 보기"
  on public.used_items for select
  to authenticated
  using (
    (is_hidden = false or seller_id = (select auth.uid()))
    and not exists (select 1 from public.blocks b where b.blocker_id = (select auth.uid()) and b.blocked_id = seller_id)
  );

-- 차단 관계에서는 채팅을 시작하거나 메시지를 보낼 수 없다
drop policy "구매 희망자가 채팅 시작" on public.chat_rooms;
create policy "구매 희망자가 채팅 시작"
  on public.chat_rooms for insert
  to authenticated
  with check (
    buyer_id = (select auth.uid())
    and exists (
      select 1 from public.used_items i
      where i.id = item_id and i.status <> 'sold' and i.seller_id <> (select auth.uid())
        and not public.is_block_between((select auth.uid()), i.seller_id)
    )
  );

drop policy "참여자만 메시지 보내기" on public.chat_messages;
create policy "참여자만 메시지 보내기"
  on public.chat_messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.chat_rooms r
      where r.id = room_id and (select auth.uid()) in (r.buyer_id, r.seller_id)
        and not public.is_block_between(r.buyer_id, r.seller_id)
    )
  );

-- ─────────────────────────────────────────────
-- 2. 매물·채팅도 신고할 수 있게 신고 표 확장
-- ─────────────────────────────────────────────
alter table public.reports
  add column used_item_id uuid references public.used_items (id) on delete cascade,
  add column chat_room_id uuid references public.chat_rooms (id) on delete cascade,
  drop constraint reports_one_target,
  add constraint reports_one_target check (num_nonnulls(post_id, comment_id, used_item_id, chat_room_id) = 1);

create unique index reports_unique_used_item on public.reports (reporter_id, used_item_id) where used_item_id is not null;
create unique index reports_unique_chat_room on public.reports (reporter_id, chat_room_id) where chat_room_id is not null;

drop policy "남의 글·댓글 신고" on public.reports;
create policy "남의 글·댓글·매물·채팅 신고"
  on public.reports for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and (
      exists (select 1 from public.posts p where p.id = post_id and p.author_id <> (select auth.uid()))
      or exists (select 1 from public.comments c where c.id = comment_id and c.author_id <> (select auth.uid()))
      or exists (select 1 from public.used_items i where i.id = used_item_id and i.seller_id <> (select auth.uid()))
      -- 채팅은 내가 참여한 방만 신고할 수 있다 (운영자가 대화 내용을 확인)
      or exists (select 1 from public.chat_rooms r where r.id = chat_room_id
                 and (select auth.uid()) in (r.buyer_id, r.seller_id))
    )
  );

grant insert (used_item_id, chat_room_id) on public.reports to authenticated;

create or replace function public.hide_reported_content()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  threshold integer := public.setting_int('report_hide_threshold', 3);
begin
  if new.post_id is not null then
    if (select count(*) from public.reports where post_id = new.post_id) >= threshold then
      update public.posts set is_hidden = true where id = new.post_id;
    end if;
  elsif new.comment_id is not null then
    if (select count(*) from public.reports where comment_id = new.comment_id) >= threshold then
      update public.comments set is_hidden = true where id = new.comment_id;
    end if;
  elsif new.used_item_id is not null then
    if (select count(*) from public.reports where used_item_id = new.used_item_id) >= threshold then
      update public.used_items set is_hidden = true where id = new.used_item_id;
    end if;
  end if;
  -- 채팅 신고는 자동 숨김 없이 운영자가 확인한다
  return null;
end;
$$;

-- ─────────────────────────────────────────────
-- 3. 회원 탈퇴: 계정을 지우면 프로필·아이 정보·글·댓글·매물·채팅·주문 기록이 함께 지워진다
--    (매물 사진은 앱이 먼저 지운 뒤 이 함수를 부른다)
-- ─────────────────────────────────────────────
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception '로그인이 필요해요'; end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ─────────────────────────────────────────────
-- 4. 안전결제 수수료: 등급 할인 + 수수료 쿠폰 (데모: 실제 결제 없음)
-- ─────────────────────────────────────────────
alter table public.used_items
  add column fee_amount integer,                      -- 안전결제 수수료 (직거래는 0)
  add column fee_coupon_id uuid references public.user_coupons (id);

drop function public.complete_used_trade(uuid, text);

create function public.complete_used_trade(p_room_id uuid, p_method text, p_coupon_id uuid default null)
returns integer                                      -- 실제 적용된 수수료
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  room public.chat_rooms;
  item public.used_items;
  rate numeric;
  level_disc numeric;
  coupon public.coupon_templates;
  fee integer := 0;
begin
  if p_method not in ('direct', 'safe') then
    raise exception '거래 방식이 올바르지 않아요';
  end if;

  select * into room from public.chat_rooms where id = p_room_id;
  if room.id is null or room.seller_id <> uid then
    raise exception '판매자만 거래를 완료할 수 있어요';
  end if;

  select * into item from public.used_items where id = room.item_id for update;
  if item.status = 'sold' then raise exception '이미 거래가 끝난 매물이에요'; end if;
  if p_method = 'safe' and not item.safe_pay_available then
    raise exception '안전결제를 받지 않는 매물이에요';
  end if;

  if p_method = 'safe' then
    rate := coalesce((select (value #>> '{}')::numeric from public.app_settings where key = 'used_safe_pay_fee_rate'), 0);
    level_disc := coalesce((select (value ->> public.member_level(uid)::text)::numeric
                            from public.app_settings where key = 'used_fee_discount_by_level'), 0);
    fee := round(item.price * rate * (100 - level_disc) / 100.0);
    if p_coupon_id is not null then
      coupon := public.use_coupon(uid, p_coupon_id, array['used_fee_percent'], 'used_trade:' || item.id);
      fee := round(fee * (100 - coupon.value) / 100.0);
    end if;
  end if;

  update public.used_items
  set status = 'sold', buyer_id = room.buyer_id, trade_method = p_method, sold_at = now(),
      fee_amount = fee, fee_coupon_id = p_coupon_id
  where id = item.id;

  return fee;
end;
$$;

revoke execute on function public.complete_used_trade(uuid, text, uuid) from public, anon;
grant execute on function public.complete_used_trade(uuid, text, uuid) to authenticated;
