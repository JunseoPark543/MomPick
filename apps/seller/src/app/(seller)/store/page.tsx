"use client";

import { useState, type FormEvent } from "react";

import { Button, Card, ErrorText, Loading, PageTitle } from "@/components/ui";
import { useSeller } from "@/lib/seller";
import { supabase } from "@/lib/supabase";
import { unwrap, useLoad } from "@/lib/useLoad";

type Store = {
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  business_number: string;
};

// 업체 정보: 이름·소개(회원에게 보임), 연락처(운영팀만 봄). 수정은 대표만.
export default function StorePage() {
  const seller = useSeller();
  const isOwner = seller.role === "owner";

  const { data: loaded, error: loadError } = useLoad<Store>(async () => {
    const sb = supabase();
    const [s, c] = await Promise.all([
      sb.from("sellers").select("name, description").eq("id", seller.id).single(),
      sb.from("seller_contacts").select("contact_email, contact_phone, business_number").eq("seller_id", seller.id).single(),
    ]);
    const store = unwrap(s);
    const contact = unwrap(c);
    return { ...store, ...contact, business_number: contact.business_number ?? "" };
  }, [seller.id]);

  const [edits, setEdits] = useState<Partial<Store>>({});
  const form = loaded ? { ...loaded, ...edits } : null;
  const set = (key: keyof Store, value: string) => setEdits((prev) => ({ ...prev, [key]: value }));

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const sb = supabase();
    const [a, b] = await Promise.all([
      sb.from("sellers").update({ name: form.name.trim(), description: form.description.trim() }).eq("id", seller.id),
      sb
        .from("seller_contacts")
        .update({
          contact_email: form.contact_email.trim(),
          contact_phone: form.contact_phone.trim(),
          business_number: form.business_number.trim() || null,
        })
        .eq("seller_id", seller.id),
    ]);
    setSaving(false);
    if (a.error || b.error) return setError((a.error ?? b.error)?.message ?? "");
    setSaved(true);
  }

  const input = "mb-4 w-full rounded-lg border border-line px-3 py-2 disabled:bg-background";

  return (
    <>
      <PageTitle title="업체 정보" description={isOwner ? "업체 이름과 소개는 앱의 상품 화면에 판매처로 보여요." : "업체 정보 수정은 대표만 할 수 있어요."} />
      <ErrorText>{loadError || error}</ErrorText>
      {saved ? <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">저장했어요.</p> : null}
      {!form ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl">
          <Card>
            <label className="mb-1 block text-sm font-semibold">업체 이름</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={input} minLength={2} maxLength={40} disabled={!isOwner} required />
            <label className="mb-1 block text-sm font-semibold">업체 소개</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} maxLength={500} className={input} disabled={!isOwner} />
            <hr className="my-4 border-line" />
            <p className="mb-3 text-xs text-muted">아래 연락처는 맘픽 운영팀만 볼 수 있어요.</p>
            <label className="mb-1 block text-sm font-semibold">연락 이메일</label>
            <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className={input} disabled={!isOwner} required />
            <label className="mb-1 block text-sm font-semibold">연락처</label>
            <input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className={input} minLength={8} maxLength={20} disabled={!isOwner} required />
            <label className="mb-1 block text-sm font-semibold">사업자등록번호</label>
            <input value={form.business_number} onChange={(e) => set("business_number", e.target.value)} className={input} maxLength={20} disabled={!isOwner} />
            {isOwner ? (
              <Button variant="primary" size="md" disabled={saving}>
                {saving ? "저장 중…" : "저장하기"}
              </Button>
            ) : null}
          </Card>
        </form>
      )}
    </>
  );
}
