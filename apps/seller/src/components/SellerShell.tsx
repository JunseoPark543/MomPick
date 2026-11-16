"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import ApplyForm from "@/components/ApplyForm";
import { Button } from "@/components/ui";
import { SellerContext, type CurrentSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";

const MENU = [
  { href: "/", label: "대시보드" },
  { href: "/products", label: "상품" },
  { href: "/orders", label: "주문·배송" },
  { href: "/subscriptions", label: "정기 구독" },
  { href: "/store", label: "업체 정보" },
] as const;

type Membership = { role: "owner" | "staff"; seller: { id: string; name: string; status: string } | null };

type View = { kind: "checking" } | { kind: "no-store" } | { kind: "store"; seller: CurrentSeller };

// 판매자 화면의 문지기: 로그인 확인 → 업체 상태(신청 전/심사 중/반려/정지/활동)에 맞는 화면
export default function SellerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<View>({ kind: "checking" });
  const [email, setEmail] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const sb = supabase();
    let cancelled = false;

    sb.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const { data: memberships } = await sb
        .from("seller_members")
        .select("role, seller:sellers(id, name, status)")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false })
        .returns<Membership[]>();
      if (cancelled) return;
      setEmail(data.session.user.email ?? "");
      // 활동 중인 업체가 있으면 그 업체, 없으면 가장 최근 신청
      const list = (memberships ?? []).filter((m) => m.seller);
      const pick = list.find((m) => m.seller?.status === "active") ?? list[0];
      setView(pick?.seller ? { kind: "store", seller: { ...pick.seller, role: pick.role } } : { kind: "no-store" });
    });

    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/login");
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router, version]);

  const signOut = () => supabase().auth.signOut();
  const recheck = () => setVersion((v) => v + 1);

  if (view.kind === "checking") return <p className="p-10 text-center text-muted">확인 중…</p>;

  if (view.kind === "no-store") {
    return (
      <div className="p-5">
        <ApplyForm onApplied={recheck} />
        <p className="mt-4 text-center text-xs text-muted">
          {email} ·{" "}
          <button onClick={signOut} className="underline">
            로그아웃
          </button>
        </p>
      </div>
    );
  }

  const { seller } = view;

  if (seller.status !== "active") {
    const messages: Record<string, { title: string; text: string }> = {
      pending: { title: "입점 심사 중이에요", text: "맘픽 운영팀이 확인하고 있어요. 승인되면 이 화면에서 바로 상품을 등록할 수 있어요." },
      rejected: { title: "입점 신청이 반려되었어요", text: "자세한 내용은 맘픽 운영팀에 문의해 주세요. 내용을 보완해 다시 신청할 수 있어요." },
      suspended: { title: "판매가 정지되었어요", text: "정지 기간에는 상품이 앱에 보이지 않고 주문을 받을 수 없어요. 맘픽 운영팀에 문의해 주세요." },
    };
    const m = messages[seller.status] ?? messages.pending;
    return (
      <div className="mx-auto mt-24 max-w-md rounded-2xl border border-line bg-white p-8 text-center">
        <p className="text-sm font-semibold text-brand">{seller.name}</p>
        <h1 className="mt-1 text-xl font-bold">{m.title}</h1>
        <p className="mt-2 text-sm text-muted">{m.text}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={recheck}>상태 다시 확인</Button>
          {seller.status === "rejected" ? (
            <Button variant="primary" onClick={() => setView({ kind: "no-store" })}>
              다시 신청하기
            </Button>
          ) : null}
          <Button variant="ghost" onClick={signOut}>
            로그아웃
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SellerContext.Provider value={seller}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="border-b border-line bg-white md:w-56 md:shrink-0 md:border-b-0 md:border-r">
          <div className="px-5 py-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="맘픽" width={64} height={36} priority />
              <span className="text-sm font-bold text-muted">판매자</span>
            </div>
            <p className="mt-2 truncate text-sm font-bold">{seller.name}</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
            {MENU.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                    active ? "bg-brand-soft text-brand" : "text-foreground hover:bg-background"
                  }`}>
                  {item.label}
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
    </SellerContext.Provider>
  );
}
