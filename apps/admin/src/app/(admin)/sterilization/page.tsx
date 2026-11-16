"use client";

import { STERILIZE_ITEM_LABELS, STERILIZE_STATUS_LABELS, label } from "@mompick/shared";
import { useState } from "react";

import { Badge, Button, Empty, ErrorText, Loading, PageTitle, Table, Td, type Tone } from "@/components/ui";
import { formatDateTime, formatWon } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Request = {
  id: string;
  items: string[];
  pickup_date: string;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  address_detail: string;
  memo: string;
  total: number;
  discount: number;
  status: string;
  created_at: string;
  member: { nickname: string | null } | null;
};

const COLUMNS =
  "id, items, pickup_date, recipient_name, recipient_phone, address, address_detail, memo, total, discount, status, created_at, member:profiles(nickname)";

const STATUS_TONE: Record<string, Tone> = { requested: "yellow", scheduled: "blue", done: "green", cancelled: "gray" };
const STATUSES = ["requested", "scheduled", "done", "cancelled"];

type Filter = "open" | "all";

// 살균 신청: 수거 일정 잡기 → 완료 (데모: 실제 수거 연동 없음)
export default function SterilizationPage() {
  const [filter, setFilter] = useState<Filter>("open");
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload } = useLoad<Request[]>(async () => {
    let q = supabase().from("sterilization_requests").select(COLUMNS).order("pickup_date");
    if (filter === "open") q = q.in("status", ["requested", "scheduled"]);
    return unwrap(await q.limit(300).returns<Request[]>());
  }, [filter]);

  async function setStatus(id: string, status: string) {
    setActionError("");
    const res = await supabase().from("sterilization_requests").update({ status }).eq("id", id);
    if (res.error) return setActionError(res.error.message);
    reload();
  }

  return (
    <>
      <PageTitle
        title="살균 신청"
        description="수거 희망일 순서. 상태를 바꾸면 회원 앱의 신청 내역에 바로 보여요."
        right={
          <div className="flex gap-2">
            <Button variant={filter === "open" ? "primary" : "secondary"} onClick={() => setFilter("open")}>
              진행 중
            </Button>
            <Button variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>
              전체
            </Button>
          </div>
        }
      />
      <ErrorText>{error || actionError}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>신청이 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["수거 희망일", "품목", "수거지", "금액", "신청", "상태"]}>
          {data.map((r) => (
            <tr key={r.id}>
              <Td className="whitespace-nowrap font-semibold">{r.pickup_date}</Td>
              <Td>{r.items.map((i) => label(STERILIZE_ITEM_LABELS, i)).join(", ")}</Td>
              <Td className="text-xs">
                <p className="font-semibold">
                  {r.recipient_name} · {r.recipient_phone}
                </p>
                <p>
                  {r.address} {r.address_detail}
                </p>
                {r.memo ? <p className="text-muted">요청: {r.memo}</p> : null}
              </Td>
              <Td className="whitespace-nowrap">
                {formatWon(r.total)}
                {r.discount > 0 ? <p className="text-xs text-muted">쿠폰 -{formatWon(r.discount)}</p> : null}
              </Td>
              <Td className="whitespace-nowrap text-xs text-muted">
                {r.member?.nickname}
                <p>{formatDateTime(r.created_at)}</p>
              </Td>
              <Td>
                <Badge tone={STATUS_TONE[r.status]}>{label(STERILIZE_STATUS_LABELS, r.status)}</Badge>
                <select
                  value={r.status}
                  onChange={(e) => setStatus(r.id, e.target.value)}
                  className="mt-2 block rounded-lg border border-line bg-white px-2 py-1 text-sm">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {label(STERILIZE_STATUS_LABELS, s)}
                    </option>
                  ))}
                </select>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
