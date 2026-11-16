"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ErrorText } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError("이메일 또는 비밀번호가 맞지 않아요.");
      return;
    }
    router.replace("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <div className="mb-6 flex items-center gap-2">
          <Image src="/brand/logo-login.png" alt="맘픽" width={80} height={45} preload />
          <span className="font-bold text-muted">관리자</span>
        </div>
        <ErrorText>{error}</ErrorText>
        <label className="mb-1 block text-sm font-semibold">이메일</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-line px-3 py-2.5"
          required
        />
        <label className="mb-1 block text-sm font-semibold">비밀번호</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg border border-line px-3 py-2.5"
          required
        />
        <Button variant="primary" size="md" className="w-full" disabled={loading}>
          {loading ? "로그인 중…" : "로그인"}
        </Button>
        <p className="mt-4 text-xs text-muted">관리자로 등록된 계정만 들어갈 수 있어요.</p>
      </form>
    </div>
  );
}
