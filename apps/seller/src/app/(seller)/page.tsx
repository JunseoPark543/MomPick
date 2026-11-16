"use client";

import Link from "next/link";

import { Card, ErrorText, Loading, PageTitle } from "@/components/ui";
import { useSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Counts = { toShip: number; shipping: number; selling: number; soldOut: number; subscribers: number };

// 판매자 대시보드: 처리할 주문과 상품 상태
export default function DashboardPage() {
  const seller = useSeller();
  const { data, error, loading } = useLoad<Counts>(async () => {
    const sb = supabase();
    const [items, products, subs] = await Promise.all([
      sb.from("order_items").select("fulfillment_status").eq("seller_id", seller.id),
      sb.from("products").select("id, is_active, stock").eq("seller_id", seller.id),
      sb
        .from("subscriptions")
        .select("id, product:products!inner(seller_id)", { count: "exact", head: true })
        .eq("status", "active")
        .eq("product.seller_id", seller.id),
    ]);
    const orderItems = unwrap(items);
    const productList = unwrap(products);
    if (subs.error) throw new Error(subs.error.message);
    return {
      toShip: orderItems.filter((i) => i.fulfillment_status === "paid" || i.fulfillment_status === "preparing").length,
      shipping: orderItems.filter((i) => i.fulfillment_status === "shipped").length,
      selling: productList.filter((p) => p.is_active && p.stock > 0).length,
      soldOut: productList.filter((p) => p.is_active && p.stock <= 0).length,
      subscribers: subs.count ?? 0,
    };
  }, [seller.id]);

  const tiles = data
    ? [
        { label: "배송 준비할 주문", value: data.toShip, href: "/orders", urgent: data.toShip > 0 },
        { label: "배송 중", value: data.shipping, href: "/orders", urgent: false },
        { label: "판매 중 상품", value: data.selling, href: "/products", urgent: false },
        { label: "품절 상품", value: data.soldOut, href: "/products", urgent: data.soldOut > 0 },
        { label: "정기 구독 중", value: data.subscribers, href: "/subscriptions", urgent: false },
      ]
    : [];

  return (
    <>
      <PageTitle title={`${seller.name} 대시보드`} description="오늘 처리할 일" />
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
