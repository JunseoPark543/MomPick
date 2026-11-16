-- SECURITY DEFINER 안에서는 current_user 가 함수 소유자로 바뀐다.
-- 따라서 is_api_request() 는 기록 함수 안에서 항상 false 였다.
-- PostgREST 가 SET LOCAL ROLE 로 설정한 요청 역할과 관리자 명단을 확인한다.
-- guard 트리거의 is_api_request() 는 서버 내부 계산을 구분해야 하므로 그대로 둔다.
create or replace function public.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if current_setting('role', true) = 'authenticated' and public.is_admin() then
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

-- 기록은 트리거만 추가하며, 회원·관리자도 함수를 직접 실행하지 못한다.
revoke execute on function public.log_admin_change() from public, anon, authenticated;
