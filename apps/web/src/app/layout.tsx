import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

// 한글 글꼴 Pretendard (OFL-1.1, src/fonts/Pretendard-LICENSE.txt)
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "맘픽 — 우리 동네 엄마들과 함께 키우는 육아",
  description: "0~24개월 아이를 키우는 보호자를 위한 동네 육아 앱. 동네·동기 커뮤니티, 유아용품 중고거래, 이유식·육아용품 특가, 유아용품 살균 서비스를 한곳에서.",
  openGraph: {
    title: "맘픽 — 우리 동네 엄마들과 함께 키우는 육아",
    description: "동네·동기 커뮤니티, 유아용품 중고거래, 육아용품 특가, 살균 서비스를 한곳에서.",
    images: ["/logo.png"],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
