"use client";

import { PRODUCT_CATEGORY_LABELS } from "@mompick/shared";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, Card, ErrorText, Loading, PageTitle } from "@/components/ui";
import { useSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Form = {
  name: string;
  category: string;
  description: string;
  price: string;
  original_price: string;
  stock: string;
  delivery_label: string;
  subscribable: boolean;
  is_active: boolean;
  image_url: string | null;
  is_deal: boolean;
  deal_opens_at: string; // datetime-local 값 (한국 시간)
  deal_ends_at: string;
  early_access: boolean; // 보기만 (운영팀이 정함)
};

const EMPTY: Form = {
  name: "",
  category: "babyfood",
  description: "",
  price: "",
  original_price: "",
  stock: "100",
  delivery_label: "무료배송",
  subscribable: false,
  is_active: true,
  image_url: null,
  is_deal: false,
  deal_opens_at: "",
  deal_ends_at: "",
  early_access: false,
};

// ISO ↔ <input type="datetime-local"> (브라우저 시간대 기준)
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

// 상품 등록(/products/new) 또는 수정(/products/<id>)
export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const seller = useSeller();
  const router = useRouter();

  const { data: loaded, error: loadError } = useLoad<Form>(async () => {
    if (isNew) return EMPTY;
    const p = unwrap(
      await supabase()
        .from("products")
        .select("name, category, description, price, original_price, stock, delivery_label, subscribable, is_active, image_url, is_deal, deal_opens_at, deal_ends_at, early_access")
        .eq("id", id)
        .eq("seller_id", seller.id)
        .single(),
    );
    return {
      ...p,
      price: String(p.price),
      original_price: String(p.original_price),
      stock: String(p.stock),
      deal_opens_at: toLocalInput(p.deal_opens_at),
      deal_ends_at: toLocalInput(p.deal_ends_at),
    };
  }, [id, seller.id]);

  // 불러온 값 위에 사용자가 고친 값만 덮어쓴다
  const [edits, setEdits] = useState<Partial<Form>>({});
  const form = loaded ? { ...loaded, ...edits } : null;
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setEdits((prev) => ({ ...prev, [key]: value }));

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${seller.id}/${Date.now()}.${ext}`;
    const storage = supabase().storage.from("product-images");
    const { error: upError } = await storage.upload(path, file, { contentType: file.type });
    setUploading(false);
    if (upError) return setError("사진을 올리지 못했어요. 5MB 이하의 JPG·PNG·WEBP 파일인지 확인해 주세요.");
    set("image_url", storage.getPublicUrl(path).data.publicUrl);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const price = Number(form.price);
    const originalPrice = Number(form.original_price || form.price);
    if (!form.name.trim()) return setError("상품 이름을 입력해 주세요.");
    if (!(price >= 0) || !(originalPrice >= price)) return setError("정가는 판매가보다 같거나 커야 해요.");
    if (form.is_deal && (!form.deal_opens_at || !form.deal_ends_at)) return setError("특가는 시작·종료 시각을 모두 정해 주세요.");

    const values = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price,
      original_price: originalPrice,
      stock: Math.max(0, Number(form.stock) || 0),
      delivery_label: form.delivery_label.trim() || "무료배송",
      subscribable: form.subscribable,
      is_active: form.is_active,
      image_url: form.image_url,
      is_deal: form.is_deal,
      deal_opens_at: form.is_deal ? fromLocalInput(form.deal_opens_at) : null,
      deal_ends_at: form.is_deal ? fromLocalInput(form.deal_ends_at) : null,
    };

    setSaving(true);
    setError("");
    const sb = supabase().from("products");
    const { error: saveError } = isNew
      ? await sb.insert({ ...values, seller_id: seller.id })
      : await sb.update(values).eq("id", id);
    setSaving(false);
    if (saveError) return setError(saveError.message);
    router.push("/products");
  }

  const input = "w-full rounded-lg border border-line px-3 py-2";

  return (
    <>
      <PageTitle title={isNew ? "상품 등록" : "상품 수정"} />
      <ErrorText>{loadError || error}</ErrorText>
      {!form ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit} className="grid max-w-3xl gap-4">
          <Card className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">대표 사진</label>
              <div className="flex items-center gap-4">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="" className="h-24 w-24 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-background text-xs text-muted">사진 없음</div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  disabled={uploading}
                  className="text-sm"
                />
                {uploading ? <span className="text-sm text-muted">올리는 중…</span> : null}
              </div>
              <p className="mt-1 text-xs text-muted">아이 얼굴이 나온 사진은 쓰지 말아 주세요. 사진이 없으면 앱에서 분류 아이콘으로 보여요.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">상품 이름</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={input} maxLength={80} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold">분류</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className={input}>
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">배송 안내</label>
                <input value={form.delivery_label} onChange={(e) => set("delivery_label", e.target.value)} placeholder="무료배송 / 내일 도착" className={input} maxLength={20} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">상품 설명</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={input} />
            </div>
          </Card>

          <Card className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">판매가 (원)</label>
              <input type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} className={input} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">정가 (원, 할인 표시용)</label>
              <input type="number" min={0} value={form.original_price} onChange={(e) => set("original_price", e.target.value)} placeholder="비우면 판매가와 같음" className={input} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">재고</label>
              <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} className={input} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4" />
              앱에 판매 중으로 보이기
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.subscribable} onChange={(e) => set("subscribable", e.target.checked)} className="h-4 w-4" />
              정기 구독 받기
            </label>
          </Card>

          <Card className="grid gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.is_deal} onChange={(e) => set("is_deal", e.target.checked)} className="h-4 w-4" />
              오늘의 특가로 제안하기
            </label>
            {form.is_deal ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">특가 시작 (오픈 시각)</label>
                  <input type="datetime-local" value={form.deal_opens_at} onChange={(e) => set("deal_opens_at", e.target.value)} className={input} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">특가 종료</label>
                  <input type="datetime-local" value={form.deal_ends_at} onChange={(e) => set("deal_ends_at", e.target.value)} className={input} />
                </div>
              </div>
            ) : null}
            <p className="text-xs text-muted">
              선구매(나무 맘 이상 오픈 30분 전 구매): {form.early_access ? "지정됨" : "지정 안 됨"} — 맘픽 운영팀이 정해요.
            </p>
          </Card>

          <div className="flex gap-2">
            <Button variant="primary" size="md" disabled={saving || uploading}>
              {saving ? "저장 중…" : isNew ? "등록하기" : "저장하기"}
            </Button>
            <Button type="button" size="md" onClick={() => router.push("/products")}>
              취소
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
