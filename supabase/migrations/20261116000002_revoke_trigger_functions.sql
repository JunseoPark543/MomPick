-- 트리거 함수는 외부(API)에서 직접 부를 일이 없으므로 실행 권한을 닫는다.
-- (Supabase 보안 점검 경고 정리. 트리거는 실행 권한과 상관없이 그대로 동작한다)
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prorettype = 'trigger'::regtype
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.signature);
  end loop;
end;
$$;

-- 앞으로 public 에 만드는 함수는 기본으로 아무도 실행할 수 없게 하고, 필요한 함수만 따로 허용한다
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
