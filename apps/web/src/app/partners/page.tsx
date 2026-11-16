import type { Metadata } from "next";
import Image from "next/image";

import { SELLER_SIGNUP_URL } from "@/lib/links";
import { visual } from "@/lib/photos";

export const metadata: Metadata = {
  title: "맘픽 입점 안내 — 0~24개월 부모가 모이는 곳에서 판매하세요",
  description: "이유식·육아용품 브랜드와 업체를 위한 맘픽 입점 안내. 입점 신청부터 상품 등록, 주문·배송 관리까지.",
};

const WHY = [
  {
    title: "꼭 필요한 고객이 모인 곳",
    text: "맘픽 회원은 0~24개월 아이를 키우는 보호자예요. 아이 월령과 동네를 바탕으로 지금 필요한 상품을 만나게 돼요.",
  },
  {
    title: "다시 찾게 만드는 등급 혜택",
    text: "등급이 오르면 쿠폰이 지급되고, 이유식·기저귀는 정기 구독으로 꾸준히 주문할 수 있어요.",
  },
  {
    title: "오늘의 특가",
    text: "판매자 센터에서 특가 가격과 기간을 제안할 수 있어요. 인기 특가는 단골 등급에게 먼저 열려 오픈 때마다 관심이 모여요.",
  },
];

const STEPS = [
  { title: "판매자 회원가입", text: "담당자 이메일로 맘픽 판매자 센터에 가입해요." },
  { title: "입점 신청", text: "업체 이름·소개와 연락처를 적어 신청해요." },
  { title: "운영팀 확인", text: "맘픽 운영팀이 신청 내용을 확인하고 승인해요." },
  { title: "판매 시작", text: "상품과 재고를 올리고, 주문이 오면 배송을 처리해요." },
];

const FEATURES = [
  { title: "상품·재고·특가", text: "사진, 가격, 재고, 정기 구독 여부, 특가 기간을 한 화면에서 관리해요." },
  { title: "주문·배송", text: "내 상품이 담긴 주문만 모아 보고, 송장을 입력해 발송해요." },
  { title: "정기 구독", text: "구독 주기와 다음 배송일을 한눈에 확인해요." },
];

export default function PartnersPage() {
  const hero = visual("partners", "포장을 마친 육아용품", { src: "/screens/market.jpg", width: 600, height: 675 });

  return (
    <div className="mx-auto max-w-[1100px] px-6">
      <section className="pb-16 pt-20 md:pb-24 md:pt-28">
        <h1 className="text-[40px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[64px]">
          아이를 키우는 부모가
          <br />
          모이는 곳에서 판매하세요
        </h1>
        <p className="mt-6 max-w-[560px] text-[18px] leading-[1.75] text-sub md:text-[20px]">
          이유식, 기저귀, 물티슈, 목욕·수유용품, 장난감까지. 맘픽 판매자 센터에서 신청부터 판매까지 바로 시작할 수 있어요.
        </p>
        <ApplyLink className="mt-10" />
      </section>

      {hero.kind === "photo" ? (
        <div className="relative mb-24 aspect-[27/11] overflow-hidden rounded-[24px] bg-soft">
          <Image src={hero.src} alt={hero.alt} fill sizes="1100px" className="object-cover" priority />
        </div>
      ) : null}

      <section className="border-t border-line py-16 md:py-24">
        <h2 className="text-[28px] font-bold leading-snug md:text-[34px]">왜 맘픽인가요</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title}>
              <h3 className="text-[20px] font-bold">{w.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-sub">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-24">
        <h2 className="text-[28px] font-bold leading-snug md:text-[34px]">입점 절차</h2>
        <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <p className="text-sm font-semibold text-muted">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-[20px] font-bold">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-sub">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line py-16 md:py-24">
        <h2 className="text-[28px] font-bold leading-snug md:text-[34px]">판매자 센터</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <h3 className="text-[20px] font-bold">{f.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-sub">{f.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-14 max-w-[640px] text-[15px] leading-[1.7] text-sub">
          쿠폰은 업체 부담·분담·플랫폼 부담 중에서 정해 함께 운영해요. 입점 조건과 수수료는 신청 내용을 확인한 뒤 맘픽 운영팀이 따로 안내드려요.
        </p>
        <ApplyLink className="mt-10" />
      </section>
    </div>
  );
}

// 판매자 웹이 배포되기 전에는 "준비 중"으로 보인다 (주소는 lib/links.ts)
function ApplyLink({ className = "" }: { className?: string }) {
  if (!SELLER_SIGNUP_URL) {
    return <p className={`text-[17px] font-semibold text-muted ${className}`}>판매자 센터 오픈 준비 중이에요</p>;
  }
  return (
    <a href={SELLER_SIGNUP_URL} className={`inline-block text-[17px] font-semibold text-brand hover:underline ${className}`}>
      입점 신청하기 ↗
    </a>
  );
}
