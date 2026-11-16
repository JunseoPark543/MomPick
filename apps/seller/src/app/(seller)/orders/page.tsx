"use client";

import { FULFILLMENT_LABELS, label } from "@mompick/shared";
import { useState } from "react";

import { Badge, Button, Empty, ErrorText, Loading, PageTitle, Table, Td, type Tone } from "@/components/ui";
import { formatDateTime, formatWon } from "@/lib/format";
import { useSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Item = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  fulfillment_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  order: {
    created_at: string;
    recipient_name: string;
    recipient_phone: string;
    address: string;
    address_detail: string;
    memo: string;
  } | null;
};

const TONE: Record<string, Tone> = { paid: "yellow", preparing: "blue", shipped: "blue", delivered: "green", cancelled: "gray" };

type Filter = "todo" | "shipped" | "all";

// 주문·배송: 내 업체 상품이 든 주문만 보이고, 배송 상태와 송장을 입력한다 (데모: 결제는 가짜)
export default function OrdersPage() {
  const seller = useSeller();
  const [filter, setFilter] = useState<Filter>("todo");
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");

  const { data, error, loading, reload } = useLoad<Item[]>(async () => {
    let q = supabase()
      .from("order_items")
      .select(
        "id, product_name, quantity, unit_price, fulfillment_status, tracking_number, shipped_at, order:orders(created_at, recipient_name, recipient_phone, address, address_detail, memo)",
      )
      .eq("seller_id", seller.id);
    if (filter === "todo") q = q.in("fulfillment_status", ["paid", "preparing"]);
    if (filter === "shipped") q = q.eq("fulfillment_status", "shipped");
    const items = unwrap(await q.limit(300).returns<Item[]>());
    // 오래된 주문부터 처리하도록
    return items.sort((a, b) => (a.order?.created_at ?? "").localeCompare(b.order?.created_at ?? ""));
  }, [seller.id, filter]);

  async function update(item: Item, values: { fulfillment_status: string; tracking_number?: string | null; shipped_at?: string | null }) {
    setActionError("");
    const res = await supabase().from("order_items").update(values).eq("id", item.id);
    if (res.error) return setActionError(res.error.message);
    reload();
  }

  function ship(item: Item) {
    const number = (tracking[item.id] ?? item.tracking_number ?? "").trim();
    if (!number) return setActionError("송장 번호를 입력해 주세요.");
    update(item, { fulfillment_status: "shipped", tracking_number: number, shipped_at: new Date().toISOString() });
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "todo", label: "배송 준비" },
    { value: "shipped", label: "배송 중" },
    { value: "all", label: "전체" },
  ];

  return (
    <>
      <PageTitle
        title="주문·배송"
        description="오래된 주문부터 보여요. 배송지는 배송에만 써 주세요."
        right={
          <div className="flex gap-2">
            {filters.map((f) => (
              <Button key={f.value} variant={filter === f.value ? "primary" : "secondary"} onClick={() => setFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>
        }
      />
      <ErrorText>{error || actionError}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>해당하는 주문이 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["주문 시각", "상품", "받는 분·배송지", "상태", "처리"]}>
          {data.map((it) => (
            <tr key={it.id}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(it.order?.created_at)}</Td>
              <Td>
                <p className="font-semibold">
                  {it.product_name} × {it.quantity}
                </p>
                <p className="text-xs text-muted">{formatWon(it.unit_price * it.quantity)}</p>
              </Td>
              <Td className="text-xs">
                <p className="font-semibold">
                  {it.order?.recipient_name} · {it.order?.recipient_phone}
                </p>
                <p>
                  {it.order?.address} {it.order?.address_detail}
                </p>
                {it.order?.memo ? <p className="text-muted">메모: {it.order.memo}</p> : null}
              </Td>
              <Td>
                <Badge tone={TONE[it.fulfillment_status]}>{label(FULFILLMENT_LABELS, it.fulfillment_status)}</Badge>
                {it.tracking_number ? <p className="mt-1 text-xs text-muted">송장 {it.tracking_number}</p> : null}
              </Td>
              <Td>
                {it.fulfillment_status === "paid" ? (
                  <Button onClick={() => update(it, { fulfillment_status: "preparing" })}>상품 준비 시작</Button>
                ) : null}
                {it.fulfillment_status === "paid" || it.fulfillment_status === "preparing" ? (
                  <div className="mt-1 flex gap-1">
                    <input
                      value={tracking[it.id] ?? ""}
                      onChange={(e) => setTracking((prev) => ({ ...prev, [it.id]: e.target.value }))}
                      placeholder="송장 번호"
                      className="w-32 rounded-lg border border-line px-2 py-1 text-sm"
                    />
                    <Button variant="primary" onClick={() => ship(it)}>
                      발송
                    </Button>
                  </div>
                ) : null}
                {it.fulfillment_status === "shipped" ? (
                  <Button onClick={() => update(it, { fulfillment_status: "delivered" })}>배송 완료로</Button>
                ) : null}
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
