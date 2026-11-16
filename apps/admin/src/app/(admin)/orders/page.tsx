"use client";

import { FULFILLMENT_LABELS, label } from "@mompick/shared";

import { Badge, Empty, ErrorText, Loading, PageTitle, Table, Td, type Tone } from "@/components/ui";
import { formatDateTime, formatWon } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Order = {
  id: string;
  status: string;
  total: number;
  discount: number;
  shipping_fee: number;
  created_at: string;
  recipient_name: string;
  address: string;
  buyer: { nickname: string | null } | null;
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
    fulfillment_status: string;
    tracking_number: string | null;
    seller: { name: string } | null;
  }[];
};

const COLUMNS =
  "id, status, total, discount, shipping_fee, created_at, recipient_name, address, buyer:profiles(nickname), items:order_items(product_name, quantity, unit_price, fulfillment_status, tracking_number, seller:sellers(name))";

const TONE: Record<string, Tone> = { paid: "yellow", preparing: "blue", shipped: "blue", delivered: "green", cancelled: "gray" };

// 주문: 전체 주문과 업체별 배송 상태 (배송 처리는 판매자 웹에서)
export default function OrdersPage() {
  const { data, error, loading } = useLoad<Order[]>(async () =>
    unwrap(
      await supabase().from("orders").select(COLUMNS).order("created_at", { ascending: false }).limit(200).returns<Order[]>(),
    ),
  );

  return (
    <>
      <PageTitle title="주문" description="최근 200건. 데모라 모든 결제는 가짜 결제예요. 배송 처리는 판매자가 판매자 웹에서 해요." />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>주문이 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["주문 시각", "주문자·배송지", "상품 (업체 · 배송 상태)", "결제 금액"]}>
          {data.map((o) => (
            <tr key={o.id}>
              <Td className="whitespace-nowrap text-muted">{formatDateTime(o.created_at)}</Td>
              <Td className="text-xs">
                <p className="font-semibold">{o.buyer?.nickname ?? "-"}</p>
                <p>
                  {o.recipient_name} · {o.address}
                </p>
              </Td>
              <Td>
                {o.items.map((it, i) => (
                  <div key={i} className="mb-1 flex flex-wrap items-center gap-2">
                    <span>
                      {it.product_name} × {it.quantity}
                    </span>
                    <span className="text-xs text-muted">{it.seller?.name}</span>
                    <Badge tone={TONE[it.fulfillment_status]}>{label(FULFILLMENT_LABELS, it.fulfillment_status)}</Badge>
                    {it.tracking_number ? <span className="text-xs text-muted">송장 {it.tracking_number}</span> : null}
                  </div>
                ))}
              </Td>
              <Td className="whitespace-nowrap">
                <p className="font-semibold">{formatWon(o.total)}</p>
                <p className="text-xs text-muted">
                  배송비 {formatWon(o.shipping_fee)}
                  {o.discount > 0 ? ` · 쿠폰 -${formatWon(o.discount)}` : ""}
                </p>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
