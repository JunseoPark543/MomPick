import type { Metadata } from "next";

import Icon, { type IconName } from "@/components/Icon";
import { SELLER_SIGNUP_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "맘픽 입점 안내 — 0~24개월 부모가 모이는 곳에서 판매하세요",
  description: "이유식·육아용품 브랜드와 업체를 위한 맘픽 입점 안내. 입점 신청부터 상품 등록, 주문·배송 관리까지.",
};

const WHY: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "baby",
    title: "꼭 필요한 고객만 모인 곳",
    text: "맘픽 회원은 0~24개월 아이를 키우는 보호자예요. 아이 월령과 동네를 바탕으로 지금 필요한 상품을 만나게 돼요.",
  },
  {
    icon: "heart",
    title: "다시 찾게 만드는 등급 혜택",
    text: "등급이 오르면 쿠폰이 지급되고, 이유식·기저귀는 정기 구독으로 꾸준히 주문할 수 있어요.",
  },
  {
    icon: "clock",
    title: "오늘의 특가와 오픈런",
    text: "판매자 센터에서 특가 가격과 기간을 제안할 수 있어요. 인기 특가는 단골 등급에게 먼저 열려 오픈 때마다 관심이 모여요.",
  },
];

const STEPS = [
  { title: "판매자 회원가입", text: "담당자 이메일로 맘픽 판매자 센터에 가입해요." },
  { title: "입점 신청서 작성", text: "업체 이름·소개와 연락처를 적어 신청해요." },
  { title: "맘픽 운영팀 확인", text: "운영팀이 신청 내용을 확인하고 승인해요." },
  { title: "상품 등록·판매 시작", text: "상품과 재고를 올리고, 주문이 오면 배송을 처리해요." },
];

const FEATURES = [
  { icon: "tag" as IconName, title: "상품·재고·특가 관리", text: "사진, 가격, 재고, 정기 구독 여부, 특가 기간을 한 화면에서." },
  { icon: "bag" as IconName, title: "주문·배송 처리", text: "내 상품이 담긴 주문만 모아 보고, 송장을 입력해 발송해요." },
  { icon: "people" as IconName, title: "정기 구독 고객 관리", text: "구독 주기와 다음 배송일을 한눈에 확인해요." },
];

export default function PartnersPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-16 md:pt-24">
        <p className="text-sm font-bold text-brand md:text-base">맘픽 입점 안내</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl md:leading-[1.15]">
          0~24개월 아이를 키우는
          <br />
          부모가 모이는 곳에서 판매하세요
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/75">
          이유식, 기저귀, 물티슈, 목욕·수유용품, 장난감까지. 맘픽 판매자 센터에서 신청부터 판매까지 바로 시작할 수 있어요.
        </p>
        <ApplyButton className="mt-8" />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-3xl font-extrabold md:text-4xl">왜 맘픽인가요</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title}>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white text-brand shadow-sm">
                <Icon name={w.icon} className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-extrabold">{w.title}</h3>
              <p className="mt-3 leading-7 text-foreground/75">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-extrabold md:text-4xl">입점 절차</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-line bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-extrabold text-white">{i + 1}</span>
                <p className="mt-4 text-lg font-extrabold">{s.title}</p>
                <p className="mt-2 leading-7 text-foreground/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 className="text-3xl font-extrabold md:text-4xl">판매자 센터에서 할 수 있는 일</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl border border-line p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name={f.icon} className="h-6 w-6" />
              </div>
              <p className="mt-5 text-lg font-extrabold">{f.title}</p>
              <p className="mt-2 leading-7 text-foreground/75">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-background p-6 leading-7 text-foreground/80">
          <p className="font-extrabold text-foreground">쿠폰과 입점 조건</p>
          <p className="mt-2">
            쿠폰은 업체 부담·분담·플랫폼 부담 중에서 정해 함께 운영해요. 입점 조건과 수수료는 신청 내용을 확인한 뒤 맘픽 운영팀이 따로 안내드려요.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-foreground px-8 py-14 text-white md:px-14">
          <h2 className="text-3xl font-extrabold md:text-4xl">맘픽과 함께 판매를 시작해 보세요</h2>
          <p className="mt-3 text-lg text-white/80">신청은 몇 분이면 끝나요. 승인되면 판매자 센터에서 바로 상품을 올릴 수 있어요.</p>
          <ApplyButton className="mt-8" dark />
        </div>
      </section>
    </>
  );
}

// 판매자 웹이 배포되기 전에는 "준비 중"으로 보인다 (주소는 lib/links.ts)
function ApplyButton({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const base = `inline-block rounded-2xl px-6 py-4 text-lg font-bold ${className}`;
  if (!SELLER_SIGNUP_URL) {
    return <span className={`${base} ${dark ? "bg-white/15 text-white/80" : "bg-brand-soft text-brand"}`}>판매자 센터 오픈 준비 중이에요</span>;
  }
  return (
    <a href={SELLER_SIGNUP_URL} className={`${base} ${dark ? "bg-white text-foreground" : "bg-brand text-white"} hover:opacity-90`}>
      입점 신청하기
    </a>
  );
}
