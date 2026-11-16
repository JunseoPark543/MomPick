import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@mompick/shared";

// 브라우저에는 공개용 publishable 키만 쓴다. 판매자 권한은 DB 규칙(RLS·is_seller_member)이 지킨다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

// 페이지를 미리 만드는 단계(서버)에서는 만들지 않도록, 화면이 뜬 뒤(useEffect·버튼)에서만 부른다
export function supabase() {
  if (!url || !key) {
    throw new Error("apps/seller/.env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 를 넣어주세요.");
  }
  if (!client) client = createBrowserClient<Database>(url, key);
  return client;
}
