"use client";

import { Badge, Empty, ErrorText, Loading, PageTitle, Table, Td } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Subscription = {
  id: string;
  interval_weeks: number;
  quantity: number;
  status: string;
  next_delivery_date: string;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  address_detail: string;
  created_at: string;
  product: { name: string; seller_id: string } | null;
};

// 정기 구독: 내 상품을 구독하는 회원 목록 (데모: 정기 결제·자동 배송 연동 없음)
export default function SubscriptionsPage() {
  const seller = useSeller();
  const { data, error, loading } = useLoad<Subscription[]>(
    async () =>
      unwrap(
        await supabase()
          .from("subscriptions")
          .select(
            "id, interval_weeks, quantity, status, next_delivery_date, recipient_name, recipient_phone, address, address_detail, created_at, product:products!inner(name, seller_id)",
          )
          .eq("product.seller_id", seller.id)
          .order("next_delivery_date")
          .returns<Subscription[]>(),
      ),
    [seller.id],
  );

  return (
    <>
      <PageTitle title="정기 구독" description="다음 배송일 순서. 데모라 정기 결제와 자동 주문은 아직 없어요." />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>아직 구독자가 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["다음 배송", "상품", "주기·수량", "받는 분·배송지", "상태"]}>
          {data.map((s) => (
            <tr key={s.id} className={s.status === "active" ? "" : "opacity-50"}>
              <Td className="whitespace-nowrap font-semibold">{s.status === "active" ? s.next_delivery_date : "-"}</Td>
              <Td>{s.product?.name}</Td>
              <Td className="whitespace-nowrap">
                {s.interval_weeks === 1 ? "매주" : `${s.interval_weeks}주마다`} · {s.quantity}개
              </Td>
              <Td className="text-xs">
                <p className="font-semibold">
                  {s.recipient_name} · {s.recipient_phone}
                </p>
                <p>
                  {s.address} {s.address_detail}
                </p>
              </Td>
              <Td>
                {s.status === "active" ? <Badge tone="green">구독 중</Badge> : <Badge>해지</Badge>}
                <p className="mt-1 text-xs text-muted">{formatDateTime(s.created_at)} 시작</p>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
