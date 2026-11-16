-- 관리자 운영 화면 한 바퀴 시험 뒤에만 실행한다.
-- 전용 게시글·신고·살균 신청·시험으로 오른 등급과 쿠폰을 삭제한다.
-- 관리자 작업 기록은 감사 이력이라 지우지 않는다.
-- npx supabase db query --remote --file scripts/cleanup-admin-operations-e2e.sql --yes
begin;

do $$
declare
  v_post_id uuid := '03f0d590-ba6a-4c77-a23f-c34f62821274';
  v_request_id uuid := '08be07ae-bb3c-4ffc-8ae8-530d4109fb21';
  v_requester_id uuid := '418110c5-1bc2-487e-8e98-650dcf1cffde';
  v_coupon_ids uuid[] := array[
    'e6af7649-3669-410f-8a8c-eb17fb853926'::uuid,
    'e08f5250-3fe6-4f05-81a8-32f4a98c8d3f'::uuid,
    'e16881cf-725b-4453-81d0-9a64f5594830'::uuid,
    '8740724e-d512-4866-9037-648826e71b62'::uuid
  ];
begin
  if not exists (select 1 from public.posts where id = v_post_id and title = 'admin-e2e-20261117') then
    raise exception '시험 게시글을 찾지 못했어요';
  end if;
  if not exists (select 1 from public.sterilization_requests where id = v_request_id and memo = 'admin-e2e-20261117') then
    raise exception '시험 살균 신청을 찾지 못했어요';
  end if;
  if (select count(*) from public.user_coupons where id = any(v_coupon_ids) and user_id = v_requester_id) <> 4 then
    raise exception '시험으로 생긴 쿠폰 4장을 찾지 못했어요';
  end if;

  delete from public.user_coupons where id = any(v_coupon_ids) and user_id = v_requester_id;
  delete from public.sterilization_requests where id = v_request_id;
  update public.profiles
  set level = 0, level_updated_at = null
  where id = v_requester_id and level = 2;
  delete from public.posts where id = v_post_id;
end;
$$;

commit;

select
  (select count(*) from public.posts where id = '03f0d590-ba6a-4c77-a23f-c34f62821274') as remaining_test_posts,
  (select count(*) from public.reports where id = 'bfb96922-5b5f-4a02-a1fd-4c3d77ea42e4') as remaining_test_reports,
  (select count(*) from public.sterilization_requests where id = '08be07ae-bb3c-4ffc-8ae8-530d4109fb21') as remaining_test_requests,
  (select level from public.profiles where id = '418110c5-1bc2-487e-8e98-650dcf1cffde') as requester_level;
