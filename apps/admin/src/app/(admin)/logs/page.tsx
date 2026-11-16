"use client";

import { useState } from "react";

import { Badge, Empty, ErrorText, Loading, PageTitle, Table, Td } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Action = {
  id: number;
  admin_id: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  detail: { old?: Record<string, unknown> | null; new?: Record<string, unknown> | null };
  created_at: string;
};

const TABLE_LABELS: Record<string, string> = {
  posts: "게시글",
  comments: "댓글",
  used_items: "중고 매물",
  reports: "신고",
  sellers: "입점업체",
  products: "상품",
  order_items: "주문 상품",
  sterilization_requests: "살균 신청",
  app_settings: "설정값",
  grade_levels: "등급",
  coupon_templates: "쿠폰",
  badges: "배지",
};

const ACTION_LABELS: Record<string, string> = { INSERT: "추가", UPDATE: "수정", DELETE: "삭제" };

// 무엇이 바뀌었는지만 골라서 보여준다
function changes(detail: Action["detail"]): string[] {
  const before = detail.old ?? {};
  const after = detail.new ?? {};
  return Object.keys(after)
    .filter((k) => k !== "updated_at" && JSON.stringify(before[k]) !== JSON.stringify(after[k]))
    .map((k) => `${k}: ${JSON.stringify(before[k] ?? null)} → ${JSON.stringify(after[k])}`);
}

// 관리자 작업 기록 (지우거나 고칠 수 없음)
export default function LogsPage() {
  const [names, setNames] = useState<Record<string, string>>({});
  const { data, error, loading } = useLoad<Action[]>(async () => {
    const sb = supabase();
    const actions = unwrap(
      await sb.from("admin_actions").select("*").order("created_at", { ascending: false }).limit(300).returns<Action[]>(),
    );
    const ids = [...new Set(actions.map((a) => a.admin_id).filter((id): id is string => !!id))];
    if (ids.length > 0) {
      const { data: profiles } = await sb.from("profiles").select("id, nickname").in("id", ids);
      setNames(Object.fromEntries((profiles ?? []).map((p) => [p.id, p.nickname ?? p.id.slice(0, 8)])));
    }
    return actions;
  });

  return (
    <>
      <PageTitle title="작업 기록" description="관리자가 바꾼 내용이 자동으로 남아요. 최근 300건." />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>아직 기록이 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["시각", "관리자", "대상", "작업", "바뀐 내용"]}>
          {data.map((a) => (
            <tr key={a.id}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(a.created_at)}</Td>
              <Td>{a.admin_id ? (names[a.admin_id] ?? a.admin_id.slice(0, 8)) : "-"}</Td>
              <Td>
                <Badge>{TABLE_LABELS[a.target_table] ?? a.target_table}</Badge>
                <p className="mt-1 font-mono text-xs text-muted">{a.target_id}</p>
              </Td>
              <Td>{ACTION_LABELS[a.action] ?? a.action}</Td>
              <Td className="font-mono text-xs">
                {changes(a.detail).map((c) => (
                  <p key={c} className="max-w-xl break-all">
                    {c}
                  </p>
                ))}
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
