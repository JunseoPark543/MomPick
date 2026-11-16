-- 신고 INSERT 정책에서 chat_rooms → reports RLS 순환 참조가 생기지 않게 한다.
-- 채팅 신고는 SECURITY DEFINER 함수 안에서 본인 참여 여부만 확인한다.
create or replace function public.can_report_chat_room(p_room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.chat_rooms r
    where r.id = p_room
      and ((select auth.uid()) = r.buyer_id or (select auth.uid()) = r.seller_id)
  );
$$;

revoke execute on function public.can_report_chat_room(uuid) from public, anon;
grant execute on function public.can_report_chat_room(uuid) to authenticated;

drop policy "남의 글·댓글·매물·채팅 신고" on public.reports;

-- 한 INSERT 정책 안의 OR 절은 관련 없는 테이블의 RLS도 평가할 수 있다.
-- 신고 대상별로 정책을 나누어 순환 참조 없이 본인 외 대상만 신고하게 한다.
create policy "남의 글 신고"
  on public.reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and post_id is not null and comment_id is null and used_item_id is null and chat_room_id is null
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id <> (select auth.uid())
    )
  );

create policy "남의 댓글 신고"
  on public.reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and post_id is null and comment_id is not null and used_item_id is null and chat_room_id is null
    and exists (
      select 1 from public.comments c
      where c.id = comment_id and c.author_id <> (select auth.uid())
    )
  );

create policy "남의 매물 신고"
  on public.reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and post_id is null and comment_id is null and used_item_id is not null and chat_room_id is null
    and exists (
      select 1 from public.used_items i
      where i.id = used_item_id and i.seller_id <> (select auth.uid())
    )
  );

create policy "내 채팅방 신고"
  on public.reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and post_id is null and comment_id is null and used_item_id is null and chat_room_id is not null
    and (select public.can_report_chat_room(chat_room_id))
  );
