"use client";

import { SELLER_STATUS_LABELS, label } from "@mompick/shared";
import { useState } from "react";

import { Badge, Button, Empty, ErrorText, Loading, PageTitle, Table, Td, type Tone } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Seller = {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  contact: { contact_email: string; contact_phone: string; business_number: string | null } | null;
  members: { role: string; member: { nickname: string | null } | null }[];
  products: { count: number }[];
};

const COLUMNS =
  "id, name, description, status, created_at, reviewed_at, contact:seller_contacts(contact_email, contact_phone, business_number), members:seller_members(role, member:profiles(nickname)), products(count)";

const STATUS_TONE: Record<string, Tone> = { pending: "yellow", active: "green", suspended: "red", rejected: "gray" };

type Filter = "pending" | "all";

// 입점업체: 신청 승인·반려, 정지·재개
export default function SellersPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [actionError, setActionError] = useState("");
  const { data, error, loading, reload } = useLoad<Seller[]>(async () => {
    let q = supabase().from("sellers").select(COLUMNS).order("created_at", { ascending: false });
    if (filter === "pending") q = q.eq("status", "pending");
    return unwrap(await q.returns<Seller[]>());
  }, [filter]);

  async function setStatus(s: Seller, status: string, confirmText: string) {
    if (!window.confirm(`${s.name}: ${confirmText}`)) return;
    setActionError("");
    const res = await supabase().from("sellers").update({ status }).eq("id", s.id);
    if (res.error) return setActionError(res.error.message);
    reload();
  }

  return (
    <>
      <PageTitle
        title="입점업체"
        description="승인된 업체만 상품을 등록할 수 있어요. 정지하면 그 업체 상품이 앱에서 사라지고 주문도 막혀요."
        right={
          <div className="flex gap-2">
            <Button variant={filter === "pending" ? "primary" : "secondary"} onClick={() => setFilter("pending")}>
              심사 대기
            </Button>
            <Button variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>
              전체
            </Button>
          </div>
        }
      />
      <ErrorText>{error || actionError}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>{filter === "pending" ? "심사 대기 중인 신청이 없어요." : "업체가 없어요."}</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["신청", "업체", "연락처", "담당자", "상품", "상태", "처리"]}>
          {data.map((s) => (
            <tr key={s.id}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(s.created_at)}</Td>
              <Td>
                <p className="font-semibold">{s.name}</p>
                {s.description ? <p className="mt-1 max-w-xs text-xs text-muted">{s.description}</p> : null}
              </Td>
              <Td className="text-xs">
                <p>{s.contact?.contact_email}</p>
                <p>{s.contact?.contact_phone}</p>
                {s.contact?.business_number ? <p className="text-muted">사업자 {s.contact.business_number}</p> : null}
              </Td>
              <Td className="text-xs">
                {s.members.map((m, i) => (
                  <p key={i}>
                    {m.member?.nickname ?? "-"} <span className="text-muted">({m.role === "owner" ? "대표" : "직원"})</span>
                  </p>
                ))}
              </Td>
              <Td>{s.products[0]?.count ?? 0}</Td>
              <Td>
                <Badge tone={STATUS_TONE[s.status]}>{label(SELLER_STATUS_LABELS, s.status)}</Badge>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {s.status === "pending" ? (
                    <>
                      <Button variant="primary" onClick={() => setStatus(s, "active", "입점을 승인할까요?")}>
                        승인
                      </Button>
                      <Button onClick={() => setStatus(s, "rejected", "입점을 반려할까요?")}>반려</Button>
                    </>
                  ) : null}
                  {s.status === "active" ? (
                    <Button variant="danger" onClick={() => setStatus(s, "suspended", "업체를 정지할까요? 상품이 앱에서 사라져요.")}>
                      정지
                    </Button>
                  ) : null}
                  {s.status === "suspended" || s.status === "rejected" ? (
                    <Button onClick={() => setStatus(s, "active", "다시 활동 상태로 바꿀까요?")}>활동으로</Button>
                  ) : null}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
