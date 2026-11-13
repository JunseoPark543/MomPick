-- 6단계: 유아용품 살균 서비스 신청 (데모: 수거·배송 일정 연동 없음)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하면 적용된다.
-- 정확한 주소는 살균 신청 때만 받아 신청서에만 저장한다.

create table public.sterilization_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  items text[] not null check (
    cardinality(items) between 1 and 10
    and items <@ array['stroller', 'carseat', 'carrier', 'toy', 'bouncer', 'highchair', 'etc']
  ),
  pickup_date date not null,
  recipient_name text not null,
  recipient_phone text not null,
  address text not null,
  address_detail text not null default '',
  memo text not null default '',
  price integer not null,
  discount integer not null default 0,
  total integer not null,
  coupon_id uuid references public.user_coupons (id),
  -- requested 신청됨 / scheduled 수거 예정 / done 완료 / cancelled 취소 (운영자가 대시보드에서 바꿈)
  status text not null default 'requested' check (status in ('requested', 'scheduled', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create index sterilization_user_idx on public.sterilization_requests (user_id, created_at desc);

alter table public.sterilization_requests enable row level security;
create policy "내 살균 신청 보기" on public.sterilization_requests for select to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.sterilization_requests from anon, authenticated;
grant select on public.sterilization_requests to authenticated;

-- 신청: 가격과 쿠폰 할인을 서버에서 계산한다
create function public.request_sterilization(
  p_items text[],
  p_pickup_date date,
  p_recipient_name text,
  p_recipient_phone text,
  p_address text,
  p_address_detail text,
  p_memo text,
  p_coupon_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_price integer;
  v_disc integer := 0;
  coupon public.coupon_templates;
  new_id uuid := gen_random_uuid();
begin
  if uid is null then raise exception '로그인이 필요해요'; end if;
  if p_pickup_date < current_date + 1 or p_pickup_date > current_date + 30 then
    raise exception '수거 희망일은 내일부터 30일 안으로 골라 주세요';
  end if;
  if coalesce(trim(p_recipient_name), '') = '' or coalesce(trim(p_recipient_phone), '') = ''
     or coalesce(trim(p_address), '') = '' then
    raise exception '이름, 연락처, 주소를 입력해 주세요';
  end if;

  v_price := cardinality(p_items) * public.setting_int('sterilization_price_per_item', 15000);

  if p_coupon_id is not null then
    coupon := public.use_coupon(uid, p_coupon_id, array['sterilization_percent'], 'sterilization:' || new_id);
    v_disc := round(v_price * coupon.value / 100.0);
  end if;

  insert into public.sterilization_requests
    (id, user_id, items, pickup_date, recipient_name, recipient_phone, address, address_detail, memo,
     price, discount, total, coupon_id)
  values
    (new_id, uid, p_items, p_pickup_date, trim(p_recipient_name), trim(p_recipient_phone), trim(p_address),
     coalesce(trim(p_address_detail), ''), coalesce(trim(p_memo), ''), v_price, v_disc, v_price - v_disc, p_coupon_id);

  return new_id;
end;
$$;

revoke execute on function public.request_sterilization(text[], date, text, text, text, text, text, uuid) from public, anon;
grant execute on function public.request_sterilization(text[], date, text, text, text, text, text, uuid) to authenticated;

-- 수거 전(신청됨 상태)에만 회원이 직접 취소할 수 있다
create function public.cancel_sterilization(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.sterilization_requests set status = 'cancelled'
  where id = p_id and user_id = auth.uid() and status = 'requested';
$$;

revoke execute on function public.cancel_sterilization(uuid) from public, anon;
grant execute on function public.cancel_sterilization(uuid) to authenticated;
