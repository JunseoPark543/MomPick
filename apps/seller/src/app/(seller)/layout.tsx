import { Suspense } from "react";

import SellerShell from "@/components/SellerShell";

// 주소(상품 ID 등)를 읽는 화면은 Suspense 안에 있어야 한다 (Next.js 16 Cache Components 규칙)
export default function SellerLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">확인 중…</p>}>
      <SellerShell>{children}</SellerShell>
    </Suspense>
  );
}
