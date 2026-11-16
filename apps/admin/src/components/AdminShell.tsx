"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";

const MENU = [
  { href: "/", label: "대시보드" },
  { href: "/reports", label: "신고" },
  { href: "/posts", label: "게시글" },
  { href: "/sellers", label: "입점업체" },
  { href: "/sterilization", label: "살균 신청" },
  { href: "/orders", label: "주문" },
  { href: "/settings", label: "운영 설정" },
  { href: "/logs", label: "작업 기록" },
] as const;

type GateState = "checking" | "not-admin" | "ok";

// 관리자 화면의 문지기 + 왼쪽 메뉴. 로그인 안 했으면 로그인 화면으로, 관리자가 아니면 안내만 보여준다.
export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<GateState>("checking");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const sb = supabase();
    let cancelled = false;

    sb.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const { data: isAdmin } = await sb.rpc("is_admin");
      if (cancelled) return;
      setEmail(data.session.user.email ?? "");
      setState(isAdmin ? "ok" : "not-admin");
    });

    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/login");
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    await supabase().auth.signOut();
  }

  if (state === "checking") {
    return <p className="p-10 text-center text-muted">확인 중…</p>;
  }

  if (state === "not-admin") {
    return (
      <div className="mx-auto mt-24 max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="text-xl font-bold">관리자 권한이 없어요</h1>
        <p className="mt-2 text-sm text-muted">
          {email} 계정은 관리자로 등록되어 있지 않아요.
          <br />
          관리자 등록은 데이터베이스에서만 할 수 있어요.
        </p>
        <Button className="mt-6" onClick={signOut}>
          다른 계정으로 로그인
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-line bg-white md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4">
          <Image src="/logo.png" alt="맘픽" width={64} height={36} priority />
          <span className="text-sm font-bold text-muted">관리자</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {MENU.map((m) => {
            const active = m.href === "/" ? pathname === "/" : pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                  active ? "bg-brand-soft text-brand" : "text-foreground hover:bg-background"
                }`}>
                {m.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-4 text-xs text-muted md:block">
          <p className="truncate">{email}</p>
          <button onClick={signOut} className="mt-1 underline">
            로그아웃
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
