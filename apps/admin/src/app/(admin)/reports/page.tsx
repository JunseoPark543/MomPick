"use client";

import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS, label } from "@mompick/shared";
import { useState } from "react";

import { Badge, Button, Empty, ErrorText, Loading, PageTitle, Table, Td } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Report = {
  id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  used_item_id: string | null;
  chat_room_id: string | null;
  reporter: { nickname: string | null } | null;
  post: { id: string; title: string; is_hidden: boolean } | null;
  comment: { id: string; body: string; is_hidden: boolean } | null;
  used_item: { id: string; title: string; is_hidden: boolean } | null;
};

const COLUMNS =
  "id, reason, detail, status, created_at, post_id, comment_id, used_item_id, chat_room_id, reporter:profiles!reports_reporter_id_fkey(nickname), post:posts(id, title, is_hidden), comment:comments(id, body, is_hidden), used_item:used_items(id, title, is_hidden)";

type Filter = "pending" | "done";

// 신고된 대상과, 그 대상을 숨길 수 있는 표
function target(r: Report) {
  if (r.post) return { kind: "글", table: "posts" as const, id: r.post.id, text: r.post.title, hidden: r.post.is_hidden };
  if (r.comment) return { kind: "댓글", table: "comments" as const, id: r.comment.id, text: r.comment.body, hidden: r.comment.is_hidden };
  if (r.used_item) return { kind: "매물", table: "used_items" as const, id: r.used_item.id, text: r.used_item.title, hidden: r.used_item.is_hidden };
  if (r.chat_room_id) return { kind: "채팅", table: null, id: r.chat_room_id, text: "채팅방 (내용은 대화 당사자와 관리자만)", hidden: false };
  return { kind: "삭제됨", table: null, id: "", text: "대상이 삭제되었어요", hidden: false };
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload } = useLoad<Report[]>(async () => {
    let q = supabase().from("reports").select(COLUMNS).order("created_at", { ascending: false }).limit(200);
    q = filter === "pending" ? q.eq("status", "pending") : q.neq("status", "pending");
    return unwrap(await q.returns<Report[]>());
  }, [filter]);

  async function act(r: Report, status: "reviewed" | "dismissed", hidden?: boolean) {
    setActionError("");
    const sb = supabase();
    const t = target(r);
    if (hidden !== undefined && t.table) {
      const res = await sb.from(t.table).update({ is_hidden: hidden }).eq("id", t.id);
      if (res.error) return setActionError(res.error.message);
    }
    const res = await sb.from("reports").update({ status }).eq("id", r.id);
    if (res.error) return setActionError(res.error.message);
    reload();
  }

  return (
    <>
      <PageTitle
        title="신고"
        description="같은 대상을 여러 명이 신고하면 자동으로 숨겨져요. 확인 후 숨김을 유지하거나 풀어 주세요."
        right={
          <div className="flex gap-2">
            <Button variant={filter === "pending" ? "primary" : "secondary"} onClick={() => setFilter("pending")}>
              처리 전
            </Button>
            <Button variant={filter === "done" ? "primary" : "secondary"} onClick={() => setFilter("done")}>
              처리 완료
            </Button>
          </div>
        }
      />
      <ErrorText>{error || actionError}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>신고가 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["신고 시각", "대상", "사유", "신고자", "상태", "처리"]}>
          {data.map((r) => {
            const t = target(r);
            return (
              <tr key={r.id}>
                <Td className="whitespace-nowrap text-muted">{formatDateTime(r.created_at)}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Badge>{t.kind}</Badge>
                    {t.hidden ? <Badge tone="red">숨김 중</Badge> : null}
                  </div>
                  <p className="mt-1 line-clamp-2 max-w-md">{t.text}</p>
                </Td>
                <Td>
                  {label(REPORT_REASON_LABELS, r.reason)}
                  {r.detail ? <p className="mt-1 text-xs text-muted">{r.detail}</p> : null}
                </Td>
                <Td>{r.reporter?.nickname ?? "-"}</Td>
                <Td>
                  <Badge tone={r.status === "pending" ? "yellow" : "gray"}>{label(REPORT_STATUS_LABELS, r.status)}</Badge>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {t.table ? (
                      <Button variant="danger" onClick={() => act(r, "reviewed", true)}>
                        숨기고 확인
                      </Button>
                    ) : null}
                    <Button onClick={() => act(r, "reviewed")}>확인함</Button>
                    <Button onClick={() => act(r, "dismissed", t.table && t.hidden ? false : undefined)}>
                      {t.hidden ? "문제없음(숨김 해제)" : "문제없음"}
                    </Button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </Table>
      ) : null}
    </>
  );
}
