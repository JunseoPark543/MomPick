"use client";

import { useState, type FormEvent } from "react";

import { Button, ErrorText } from "@/components/ui";
import { supabase } from "@/lib/supabase";

// 입점 신청서 → 업체가 '심사 중' 으로 만들어지고 신청자가 대표가 된다
export default function ApplyForm({ onApplied }: { onApplied: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: rpcError } = await supabase().rpc("apply_seller", {
      p_name: name,
      p_description: description,
      p_contact_email: email,
      p_contact_phone: phone,
      p_business_number: businessNumber,
    });
    setLoading(false);
    if (rpcError) {
      setError(rpcError.code === "P0001" ? rpcError.message : "신청하지 못했어요. 입력한 내용을 확인해 주세요.");
      return;
    }
    onApplied();
  }

  const input = "mb-4 w-full rounded-lg border border-line px-3 py-2.5";

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 w-full max-w-lg rounded-2xl border border-line bg-white p-8">
      <h1 className="text-xl font-bold">맘픽 입점 신청</h1>
      <p className="mb-6 mt-1 text-sm text-muted">신청 후 맘픽 운영팀이 확인하고 승인하면 상품을 등록할 수 있어요.</p>
      <ErrorText>{error}</ErrorText>
      <label className="mb-1 block text-sm font-semibold">업체 이름 (앱에 판매처로 보여요)</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className={input} minLength={2} maxLength={40} required />
      <label className="mb-1 block text-sm font-semibold">업체 소개</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={input} rows={3} maxLength={500} />
      <label className="mb-1 block text-sm font-semibold">연락 이메일</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required />
      <label className="mb-1 block text-sm font-semibold">연락처</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={input} minLength={8} maxLength={20} required />
      <label className="mb-1 block text-sm font-semibold">사업자등록번호 (선택)</label>
      <input value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} placeholder="000-00-00000" className={input} maxLength={20} />
      <Button variant="primary" size="md" className="w-full" disabled={loading}>
        {loading ? "신청 중…" : "입점 신청하기"}
      </Button>
      <p className="mt-3 text-xs text-muted">연락처와 사업자 정보는 맘픽 운영팀만 볼 수 있고, 회원에게는 업체 이름과 소개만 보여요.</p>
    </form>
  );
}
