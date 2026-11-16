import { Suspense } from "react";

import AdminShell from "@/components/AdminShell";

// 주소를 읽는 화면은 Suspense 안에 있어야 한다 (Next.js 16 Cache Components 규칙)
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">확인 중…</p>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
