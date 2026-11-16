"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ErrorText } from "@/components/ui";
import { supabase } from "@/lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

// 판매자 담당자 계정 가입 (맘픽 회원과 같은 계정 체계). 가입 후 입점 신청서를 쓴다.
export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) return setError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 만들어 주세요.`);
    if (!adult || !terms) return setError("만 19세 이상 확인과 약관 동의가 필요해요.");

    setLoading(true);
    setError("");
    const { data, error: signUpError } = await supabase().auth.signUp({
      email: email.trim(),
      password,
      // 서버 가입 규칙(handle_new_user)이 이 두 값을 확인한다
      options: { data: { adult_confirmed: true, terms_agreed: true } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.code === "user_already_exists" ? "이미 가입된 이메일이에요. 로그인해 주세요." : "가입하지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!data.session) {
      setInfo("가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.");
      return;
    }
    router.replace("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <div className="mb-6 flex items-center gap-2">
          <Image src="/brand/logo-login.png" alt="맘픽" width={80} height={45} preload />
          <span className="font-bold text-muted">판매자 회원가입</span>
        </div>
        <ErrorText>{error}</ErrorText>
        {info ? <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{info}</p> : null}
        <label className="mb-1 block text-sm font-semibold">담당자 이메일</label>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
          className="mb-4 w-full rounded-lg border border-line px-3 py-2.5"
          required
        />
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="h-4 w-4" />
          만 19세 이상입니다
        </label>
        <label className="mb-6 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="h-4 w-4" />
          이용약관 및 개인정보 처리에 동의합니다
        </label>
        <Button variant="primary" size="md" className="w-full" disabled={loading}>
          {loading ? "가입 중…" : "가입하고 입점 신청하기"}
        </Button>
        <p className="mt-4 text-center text-sm text-muted">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-brand underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}
