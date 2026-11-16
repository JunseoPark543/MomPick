"use client";

import { PRODUCT_CATEGORY_LABELS, label } from "@mompick/shared";
import Link from "next/link";

import { Badge, Empty, ErrorText, Loading, PageTitle, Table, Td } from "@/components/ui";
import { formatWon } from "@/lib/format";
import { useSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  original_price: number;
  stock: number;
  is_active: boolean;
  is_deal: boolean;
  early_access: boolean;
  subscribable: boolean;
  image_url: string | null;
};

// 내 업체 상품 목록 (판매 중이 아닌 상품도 보임)
export default function ProductsPage() {
  const seller = useSeller();
  const { data, error, loading } = useLoad<Product[]>(
    async () =>
      unwrap(
        await supabase()
          .from("products")
          .select("id, name, category, price, original_price, stock, is_active, is_deal, early_access, subscribable, image_url")
          .eq("seller_id", seller.id)
          .order("created_at", { ascending: false }),
      ),
    [seller.id],
  );

  return (
    <>
      <PageTitle
        title="상품"
        description="상품을 누르면 수정할 수 있어요. '나무 맘 먼저(선구매)' 지정과 노출 순서는 맘픽 운영팀이 정해요."
        right={
          <Link href="/products/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            + 상품 등록
          </Link>
        }
      />
      <ErrorText>{error}</ErrorText>
      {loading && !data ? <Loading /> : null}
      {data && data.length === 0 ? <Empty>아직 등록한 상품이 없어요.</Empty> : null}
      {data && data.length > 0 ? (
        <Table head={["상품", "분류", "가격", "재고", "표시"]}>
          {data.map((p) => (
            <tr key={p.id} className={p.is_active ? "" : "opacity-60"}>
              <Td>
                <Link href={`/products/${p.id}`} className="flex items-center gap-3 font-semibold hover:underline">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <span className="h-12 w-12 rounded-lg bg-background" />
                  )}
                  {p.name}
                </Link>
              </Td>
              <Td>{label(PRODUCT_CATEGORY_LABELS, p.category)}</Td>
              <Td className="whitespace-nowrap">
                {formatWon(p.price)}
                {p.original_price > p.price ? <p className="text-xs text-muted line-through">{formatWon(p.original_price)}</p> : null}
              </Td>
              <Td>{p.stock <= 0 ? <Badge tone="red">품절</Badge> : p.stock}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {p.is_active ? <Badge tone="green">판매 중</Badge> : <Badge>판매 중지</Badge>}
                  {p.is_deal ? <Badge tone="brand">특가</Badge> : null}
                  {p.early_access ? <Badge tone="green">나무 맘 먼저</Badge> : null}
                  {p.subscribable ? <Badge tone="blue">정기 구독</Badge> : null}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      ) : null}
    </>
  );
}
