// 여러 앱(관리자 웹·판매자 웹 등)이 함께 쓰는 DB 값 → 화면 이름표

export const BOARD_LABELS: Record<string, string> = {
  local: '동네 게시판',
  cohort: '동기 모임',
};

export const POST_CATEGORY_LABELS: Record<string, string> = {
  question: '질문',
  info: '정보',
  daily: '일상',
  recommend: '추천',
};

export const FACT_CHECK_LABELS: Record<string, string> = {
  checked: '팩트 체크됨',
  caution: '확인 필요',
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  spam: '스팸·광고',
  abuse: '욕설·비방·혐오',
  privacy: '개인정보 노출',
  misinfo: '잘못된 정보',
  other: '기타',
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: '처리 전',
  reviewed: '확인함',
  dismissed: '문제없음',
};

export const SELLER_STATUS_LABELS: Record<string, string> = {
  pending: '심사 중',
  active: '활동',
  suspended: '정지',
  rejected: '반려',
};

export const STERILIZE_ITEM_LABELS: Record<string, string> = {
  stroller: '유모차',
  carseat: '카시트',
  carrier: '아기띠',
  toy: '장난감',
  bouncer: '바운서',
  highchair: '하이체어',
  etc: '기타',
};

export const STERILIZE_STATUS_LABELS: Record<string, string> = {
  requested: '신청됨',
  scheduled: '수거 예정',
  done: '살균 완료',
  cancelled: '취소됨',
};

export const FULFILLMENT_LABELS: Record<string, string> = {
  paid: '결제 완료',
  preparing: '상품 준비',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소',
};

export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  babyfood: '이유식',
  snack: '간식',
  diaper: '기저귀',
  wipes: '물티슈',
  formula: '분유',
  bath: '목욕',
  toy: '장난감',
  etc: '기타',
};

export const COUPON_KIND_LABELS: Record<string, string> = {
  market_amount: '마켓 할인',
  market_free_shipping: '무료배송',
  sterilization_percent: '살균 할인',
  used_fee_percent: '안전결제 수수료 할인',
};

export const FUNDED_BY_LABELS: Record<string, string> = {
  platform: '플랫폼 부담',
  seller: '업체 부담',
  shared: '분담',
};

// 이름표가 없으면 값 그대로
export function label(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return '';
  return map[value] ?? value;
}
