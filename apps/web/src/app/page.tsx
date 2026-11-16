import ServiceRow from "@/components/ServiceRow";
import { APP_WEB_URL } from "@/lib/links";
import { visual } from "@/lib/photos";

// 등급 혜택 요약 — 실제 조건·쿠폰은 앱의 DB(grade_levels, coupon_templates)를 따른다
const GRADES = [
  { name: "씨앗 맘", how: "가입하고 우리 동네와 아이 월령을 설정하면 시작해요.", perk: "가입 환영 할인 쿠폰" },
  { name: "싹트 맘", how: "이유식을 처음 사거나 중고거래를 한 번 마치면 올라요.", perk: "무료배송·살균 할인 쿠폰, 안전결제 수수료 할인" },
  { name: "나무 맘", how: "살균 서비스를 이용하고 베스트 글에 선정되면 올라요.", perk: "인기 특가를 오픈 30분 전에 먼저 구매" },
  { name: "숲 맘", how: "정기 구독을 이어 가고 팩트 체크로 정보를 나누면 올라요.", perk: "키즈카페 이용권 추첨, 샘플박스 신청" },
];

const TRUST = [
  { title: "성인 보호자만", text: "만 19세 이상 보호자만 가입할 수 있어요. 가입 조건은 서버에서 한 번 더 확인해요." },
  { title: "아이 정보는 출생 연월만", text: "월령 계산에 필요한 출생 연월만 받아요. 아이 이름·사진·건강 정보는 받지 않아요." },
  { title: "동네는 동 이름까지만", text: "다른 회원에게는 동 이름까지만 보여요. 정확한 주소는 주문과 살균 신청 때만 받아요." },
  { title: "신고와 차단", text: "불편한 글·매물·채팅은 바로 신고·차단할 수 있어요. 여러 명이 신고하면 먼저 가려진 뒤 운영팀이 확인해요." },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6">
      <section className="pb-16 pt-20 md:pb-24 md:pt-28">
        <h1 className="text-[40px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[64px]">
          우리 동네 엄마들과
          <br />
          함께 키우는 육아
        </h1>
        <p className="mt-6 max-w-[560px] text-[18px] leading-[1.75] text-sub md:text-[20px]">
          맘픽은 0~24개월 아이를 키우는 보호자를 위한 동네 육아 앱이에요. 같은 동네, 같은 달에 태어난 아이의 엄마들과 이야기하고 육아용품을 나눠요.
        </p>
        <a href={APP_WEB_URL} className="mt-10 inline-block text-[17px] font-semibold text-brand hover:underline">
          웹에서 맘픽 둘러보기 ↗
        </a>
      </section>

      <ServiceRow
        title="동네·동기 커뮤니티"
        href={`${APP_WEB_URL}/community`}
        description="우리 구 엄마들이 나누는 동네 정보부터 같은 달에 태어난 아이를 키우는 동기 모임까지. 출처를 단 팩트 체크 댓글로 믿을 수 있는 육아 정보를 함께 만들어요."
        visual={visual("community", "동네 엄마들이 이야기 나누는 모습", { src: "/screens/community.jpg", width: 600, height: 714 })}
      />
      <ServiceRow
        title="유아용품 중고거래"
        href={`${APP_WEB_URL}/used`}
        description="몇 달 쓰고 작아지는 아기 옷, 금방 필요 없어지는 바운서와 카시트. 동네 엄마와 채팅으로 약속을 잡고 만나서 거래하면 수수료가 없어요."
        visual={visual("used", "육아용품을 주고받는 모습", { src: "/screens/used.jpg", width: 600, height: 834 })}
      />
      <ServiceRow
        title="이유식·육아용품 특가"
        href={`${APP_WEB_URL}/market`}
        description="매일 바뀌는 오늘의 특가와 기저귀·이유식 정기 구독. 등급이 오르면 쿠폰이 나오고, 나무 맘부터는 인기 특가를 먼저 살 수 있어요."
        visual={visual("market", "이유식과 육아용품", { src: "/screens/market.jpg", width: 600, height: 675 })}
      />
      <ServiceRow
        title="유아용품 살균 서비스"
        description="유모차·카시트·아기띠처럼 집에서 씻기 어려운 육아용품을 집 앞에서 가져가 살균한 뒤 돌려드려요. 수거 희망일만 고르면 신청이 끝나요."
        visual={visual("sterilize", "살균을 마친 유모차", { src: "/screens/sterilize.jpg", width: 600, height: 194 })}
      />

      <section className="border-t border-line py-16 md:py-24">
        <h2 className="text-[28px] font-bold leading-snug md:text-[34px]">맘 등급</h2>
        <p className="mt-5 max-w-[560px] text-[17px] leading-[1.75] text-sub">
          맘픽을 쓸수록 등급이 오르고, 오를 때마다 쿠폰과 혜택이 열려요. 한 번 오른 등급은 내려가지 않아요.
        </p>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {GRADES.map((g, i) => (
            <div key={g.name}>
              <p className="text-sm font-semibold text-muted">Lv.{i + 1}</p>
              <h3 className="mt-1 text-[22px] font-bold">{g.name}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-sub">{g.how}</p>
              <p className="mt-3 text-[15px] font-semibold leading-[1.7]">{g.perk}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-24">
        <h2 className="text-[28px] font-bold leading-snug md:text-[34px]">우리가 지키는 원칙</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title}>
              <h3 className="text-[18px] font-bold">{t.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-sub">{t.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
