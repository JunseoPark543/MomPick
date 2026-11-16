"use client";

import Link from "next/link";

import { Card, ErrorText, Loading, PageTitle } from "@/components/ui";
import { startOfTodayKst } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { useLoad } from "@/lib/useLoad";

type Counts = {
  pendingReports: number;
  pendingSellers: number;
  requestedSterilization: number;
  todayOrders: number;
  hiddenPosts: number;
  members: number;
};

async function count(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const { count: n, error } = await query;
  if (error) throw new Error(error.message);
  return n ?? 0;
}

// 대시보드: 지금 처리해야 할 일
export default function DashboardPage() {
  const { data, error, loading } = useLoad<Counts>(async () => {
    const sb = supabase();
    const head = { count: "exact" as const, head: true };
    const [pendingReports, pendingSellers, requestedSterilization, todayOrders, hiddenPosts, members] = await Promise.all([
      count(sb.from("reports").select("id", head).eq("status", "pending")),
      count(sb.from("sellers").select("id", head).eq("status", "pending")),
      count(sb.from("sterilization_requests").select("id", head).eq("status", "requested")),
      count(sb.from("orders").select("id", head).gte("created_at", startOfTodayKst())),
      count(sb.from("posts").select("id", head).eq("is_hidden", true)),
      count(sb.from("profiles").select("id", head)),
    ]);
    return { pendingReports, pendingSellers, requestedSterilization, todayOrders, hiddenPosts, members };
  });

  const tiles = data
    ? [
        { label: "처리 전 신고", value: data.pendingReports, href: "/reports", urgent: data.pendingReports > 0 },
        { label: "입점 심사 대기", value: data.pendingSellers, href: "/sellers", urgent: data.pendingSellers > 0 },
        { label: "살균 신청 (수거 전)", value: data.requestedSterilization, href: "/sterilization", urgent: data.requestedSterilization > 0 },
        { label: "오늘 주문", value: data.todayOrders, href: "/orders", urgent: false },
        { label: "숨겨진 게시글", value: data.hiddenPosts, href: "/posts", urgent: false },
        { label: "전체 회원", value: data.members, href: "/", urgent: false },
      ]
    : [];

  return (
    <>
      <PageTitle title="대시보드" description="지금 처리해야 할 일" />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Loading /> : null}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className={`transition hover:shadow-sm ${t.urgent ? "border-brand" : ""}`}>
              <p className="text-sm text-muted">{t.label}</p>
              <p className={`mt-2 text-3xl font-extrabold ${t.urgent ? "text-brand" : ""}`}>{t.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
