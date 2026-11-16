import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
