import Image from "next/image";
import Link from "next/link";

import { PRIVACY_URL, TERMS_URL } from "@/lib/links";

const NAV = [
  { href: "/", label: "서비스" },
  { href: "/partners", label: "입점 안내" },
];

export function SiteHeader() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-6">
        <Link href="/" aria-label="맘픽 홈">
          <Image src="/logo.png" alt="맘픽" width={68} height={38} priority />
        </Link>
        <nav className="flex gap-8 text-[15px] font-semibold text-sub">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
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
    <footer className="mt-24 bg-soft">
      <div className="mx-auto max-w-[1100px] px-6 py-12 text-sm text-muted">
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-semibold text-sub">
          <Link href="/partners" className="hover:text-foreground">
            입점 안내
          </Link>
          <a href={TERMS_URL} className="hover:text-foreground">
            이용약관
          </a>
          <a href={PRIVACY_URL} className="font-bold text-foreground">
            개인정보처리방침
          </a>
        </div>
        <p className="mt-8 leading-6">맘픽은 0~24개월 아이를 키우는 보호자를 위한 동네 육아 서비스예요. 지금은 데모 버전으로 운영 중이에요.</p>
        <p className="mt-2 font-bold text-sub">© 2026 MomPick</p>
      </div>
    </footer>
  );
}
