import Link from "next/link";

import Icon, { type IconName } from "@/components/Icon";
import ServiceRow from "@/components/ServiceRow";
import { APP_WEB_URL } from "@/lib/links";

// 등급 혜택 요약 — 실제 조건·쿠폰은 앱의 DB(grade_levels, coupon_templates)를 따른다
const GRADES = [
  { emoji: "🌱", name: "씨앗 맘", how: "가입하고 우리 동네·아이 월령 설정", perk: "가입 환영 할인 쿠폰" },
  { emoji: "🌿", name: "싹트 맘", how: "이유식 첫 구매 또는 중고거래 1회", perk: "무료배송·살균 할인 쿠폰, 안전결제 수수료 할인" },
  { emoji: "🌳", name: "나무 맘", how: "살균 서비스 이용 + 베스트 글 선정", perk: "특가 오픈 30분 전 먼저 구매" },
  { emoji: "🏞️", name: "숲 맘", how: "정기 구독 + 팩트 체크로 정보 나누기", perk: "키즈카페 이용권 추첨·샘플박스 신청" },
];

const TRUST: { icon: IconName; title: string; text: string }[] = [
  { icon: "people", title: "성인 보호자만 가입해요", text: "만 19세 이상 보호자만 가입할 수 있고, 가입 조건은 서버에서 한 번 더 확인해요." },
  { icon: "baby", title: "아이 정보는 출생 연월만", text: "월령 계산에 필요한 출생 연월만 받아요. 아이 이름·사진·건강 정보는 받지 않아요." },
  { icon: "pin", title: "동네는 동 단위까지만", text: "다른 회원에게는 동 이름까지만 보여요. 정확한 주소는 주문·살균 신청 때만 받아요." },
  { icon: "shield", title: "신고·차단과 운영팀 확인", text: "불편한 글·매물·채팅은 바로 신고·차단할 수 있고, 여러 명이 신고하면 먼저 가려진 뒤 운영팀이 확인해요." },
];

export default function HomePage() {
  return (
    <>
      {/* 첫 화면: 큰 제목 + 바로 둘러보기 */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 md:pt-24">
        <p className="text-sm font-bold text-brand md:text-base">0~24개월 아이를 키우는 보호자를 위한 동네 육아 앱</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl md:leading-[1.15]">
          우리 동네 엄마들과
          <br />
          함께 키우는 육아, 맘픽
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/75">
          같은 동네, 같은 달에 태어난 아이를 키우는 엄마들과 이야기하고, 금방 작아지는 육아용품은 나누고, 꼭 필요한 건 특가로 만나요.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={APP_WEB_URL} className="rounded-2xl bg-brand px-6 py-4 text-lg font-bold text-white shadow-sm hover:opacity-90">
            웹에서 바로 둘러보기
          </a>
          <span className="rounded-2xl border border-line px-5 py-4 text-sm font-semibold text-muted">App Store · Google Play 출시 준비 중</span>
        </div>
      </section>

      {/* 서비스 소개 */}
      <div id="services" className="mx-auto max-w-6xl scroll-mt-20 px-5">
        <ServiceRow
          icon="people"
          title="동네·동기 커뮤니티"
          description="우리 구 엄마들이 나누는 생생한 동네 정보부터, 같은 달에 태어난 아이를 키우는 동기 모임까지. 출처를 단 팩트 체크 댓글로 믿을 수 있는 육아 정보를 함께 만들어요."
          screen={{ src: "/screens/community.jpg", width: 600, height: 714, alt: "맘픽 동네 게시판 화면" }}
          tint="#FDECEE"
        />
        <ServiceRow
          icon="swap"
          title="유아용품 중고거래"
          description="몇 달 쓰고 작아지는 아기 옷, 금방 필요 없어지는 바운서와 카시트. 동네 엄마와 1:1 채팅으로 만나 직거래하면 수수료가 없어요. 원하면 앱 안 안전결제도 쓸 수 있어요."
          screen={{ src: "/screens/used.jpg", width: 600, height: 834, alt: "맘픽 중고거래 매물 목록 화면" }}
          tint="#FFF3DB"
        />
        <ServiceRow
          icon="bag"
          title="이유식·육아용품 특가"
          description="매일 바뀌는 오늘의 특가와 기저귀·이유식 정기 구독. 등급이 오르면 쿠폰이 지급되고, 나무 맘부터는 인기 특가를 오픈 30분 전에 먼저 살 수 있어요."
          screen={{ src: "/screens/market.jpg", width: 600, height: 675, alt: "맘픽 마켓 특가 화면" }}
          tint="#E6F0FB"
        />
        <ServiceRow
          icon="shield"
          title="유아용품 살균 서비스"
          description="유모차·카시트·아기띠처럼 집에서 씻기 어려운 육아용품을 집 앞에서 수거해 살균한 뒤 돌려드려요. 수거 희망일만 고르면 신청 끝이에요."
          screen={{ src: "/screens/sterilize.jpg", width: 600, height: 194, alt: "맘픽 살균 서비스 신청 배너" }}
          tint="#E5F4EA"
        />
      </div>

      {/* 강조: 맘 등급 */}
      <section id="grades" className="scroll-mt-20 bg-background py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white text-brand shadow-sm">
            <Icon name="heart" />
          </div>
          <h2 className="mt-8 text-3xl font-extrabold md:text-4xl">활동할수록 커지는 혜택, 맘 등급</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-foreground/75">
            씨앗에서 숲까지. 맘픽을 쓰면 쓸수록 등급이 오르고, 오를 때마다 쿠폰과 특별한 혜택이 열려요. 한 번 오른 등급은 내려가지 않아요.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GRADES.map((g, i) => (
              <div key={g.name} className="rounded-3xl border border-line bg-white p-6">
                <p className="text-sm font-bold text-muted">Lv.{i + 1}</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {g.emoji} {g.name}
                </p>
                <p className="mt-4 text-sm font-bold text-foreground/60">이렇게 올라요</p>
                <p className="mt-1 leading-7">{g.how}</p>
                <p className="mt-4 text-sm font-bold text-brand">혜택</p>
                <p className="mt-1 leading-7">{g.perk}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 안심 원칙 */}
      <section id="trust" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:py-24">
        <h2 className="text-3xl font-extrabold md:text-4xl">아이를 키우는 마음으로 만든 원칙</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name={t.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-extrabold">{t.title}</h3>
              <p className="mt-2 leading-7 text-foreground/75">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 마지막 안내 */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-brand px-8 py-14 text-white md:px-14">
          <h2 className="text-3xl font-extrabold md:text-4xl">지금 우리 동네 맘픽을 둘러보세요</h2>
          <p className="mt-3 text-lg text-white/90">로그인하지 않아도 동네 이야기와 매물, 특가를 볼 수 있어요.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={APP_WEB_URL} className="rounded-2xl bg-white px-6 py-4 text-lg font-bold text-brand hover:opacity-90">
              웹에서 바로 둘러보기
            </a>
            <Link href="/partners" className="rounded-2xl border border-white/60 px-6 py-4 text-lg font-bold text-white hover:bg-white/10">
              입점 문의
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
