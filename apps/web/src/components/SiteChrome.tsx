import Image from "next/image";
import Link from "next/link";

import { PRIVACY_URL, TERMS_URL } from "@/lib/links";

const NAV = [
  { href: "/#services", label: "서비스" },
  { href: "/#grades", label: "맘 등급" },
  { href: "/#trust", label: "안심 원칙" },
  { href: "/partners", label: "입점 문의" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="맘픽 홈">
          <Image src="/logo.png" alt="맘픽" width={72} height={40} priority />
        </Link>
        <nav className="flex gap-5 text-sm font-semibold sm:gap-8">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hidden text-foreground/80 hover:text-brand sm:inline last:inline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-foreground/80">
          <Link href="/partners" className="hover:text-brand">
            입점 문의
          </Link>
          <a href={TERMS_URL} className="hover:text-brand">
            이용약관
          </a>
          <a href={PRIVACY_URL} className="hover:text-brand">
            개인정보처리방침
          </a>
        </div>
        <p className="mt-6">맘픽은 0~24개월 아이를 키우는 보호자를 위한 동네 육아 서비스예요. 지금은 데모 버전으로 운영 중이에요.</p>
        <p className="mt-2 font-bold text-foreground">© 2026 맘픽 (MomPick)</p>
      </div>
    </footer>
  );
}
