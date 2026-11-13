// 데모용 예시 데이터 내용 (가짜 회원·글·댓글·매물)
// 실존 인물·업체와 무관한 지어낸 내용이다.

// monthsAgo: 아이가 몇 개월 전에 태어났는지 (같은 값끼리 동기 모임이 된다)
export const SEED_USERS = [
  { nickname: '도담맘', sigungu: '양천구', monthsAgo: 6 },
  { nickname: '라온이네', sigungu: '양천구', monthsAgo: 6 },
  { nickname: '목동새댁', sigungu: '양천구', monthsAgo: 12 },
  { nickname: '신정동꿀벌', sigungu: '양천구', monthsAgo: 3 },
  { nickname: '하루하루맘', sigungu: '양천구', monthsAgo: 18 },
  { nickname: '개포동곰돌', sigungu: '강남구', monthsAgo: 6 },
  { nickname: '역삼워킹맘', sigungu: '강남구', monthsAgo: 12 },
  { nickname: '대치동토끼', sigungu: '강남구', monthsAgo: 9 },
  { nickname: '봄날의아기', sigungu: '강남구', monthsAgo: 3 },
  { nickname: '망원동산책', sigungu: '마포구', monthsAgo: 9 },
  { nickname: '연남동콩이', sigungu: '마포구', monthsAgo: 18 },
  { nickname: '잠실새내맘', sigungu: '송파구', monthsAgo: 12 },
  { nickname: '석촌호수뷰', sigungu: '송파구', monthsAgo: 2 },
  { nickname: '성수동빵순', sigungu: '성동구', monthsAgo: 20 },
  { nickname: '왕십리아빠', sigungu: '성동구', monthsAgo: 9 },
];

// author: SEED_USERS 의 순서(0부터)
export const SEED_POSTS = [
  { author: 0, board: 'local', category: 'question', title: '목동 근처 소아과 야간 진료하는 곳 있을까요?', body: '아기가 저녁마다 열이 조금씩 오르는데 퇴근하고 가려니 문 연 곳이 별로 없네요. 평일 저녁 8시 넘어서도 진료하는 소아과 아시는 분 계실까요?' },
  { author: 2, board: 'local', category: 'info', title: '양천구 육아종합지원센터 장난감 대여 후기', body: '회원 가입하고 장난감 대여해 봤어요. 붕붕카랑 아기 체육관 빌렸는데 2주씩 빌릴 수 있고 상태도 깨끗했어요. 예약은 홈페이지에서 미리 하는 게 좋아요.' },
  { author: 3, board: 'local', category: 'daily', title: '오늘 파리공원 산책 다녀왔어요', body: '날이 선선해서 유모차 끌고 한 바퀴 돌았는데 아기가 바로 잠들었어요. 오후 3시쯤이 그늘도 많고 사람도 적어서 좋더라고요.' },
  { author: 1, board: 'local', category: 'recommend', title: '아기 사진 잘 찍어주는 동네 사진관 추천해요', body: '백일 사진 찍으러 다녀왔는데 사장님이 아기를 정말 잘 달래주셨어요. 의상도 여러 벌 준비돼 있어서 따로 챙길 필요가 없었어요.' },
  { author: 4, board: 'local', category: 'question', title: '18개월 아기랑 갈 만한 실내 놀이터 있나요?', body: '요즘 비가 자주 와서 실내에서 놀 곳을 찾고 있어요. 너무 크지 않고 어린 아기 구역이 따로 있는 곳이면 좋겠어요.' },
  { author: 5, board: 'local', category: 'info', title: '개포동 주민센터 영유아 프로그램 신청 시작했대요', body: '이번 달부터 영유아 오감 놀이 프로그램 신청을 받는다고 해요. 선착순이라 관심 있으신 분은 서둘러 보세요!' },
  { author: 6, board: 'local', category: 'question', title: '역삼역 근처 어린이집 대기 얼마나 걸리셨어요?', body: '복직 앞두고 어린이집 알아보는 중인데 대기가 길다고 해서 걱정이에요. 보통 몇 개월 정도 기다리셨나요?' },
  { author: 7, board: 'local', category: 'daily', title: '대치동 놀이터 새로 칠했더라고요', body: '아파트 단지 놀이터 바닥이랑 미끄럼틀 새로 칠해서 깨끗해졌어요. 아기들 데리고 나가기 좋아요.' },
  { author: 8, board: 'local', category: 'question', title: '신생아 손톱 언제부터 깎아 주셨어요?', body: '손톱이 길어서 얼굴을 자꾸 긁는데 너무 작아서 깎기가 무서워요. 다들 어떻게 하셨는지 궁금해요.' },
  { author: 9, board: 'local', category: 'recommend', title: '망원시장 이유식 재료 사기 좋은 가게', body: '채소 가게 사장님이 이유식용이라고 하면 소량으로도 잘 나눠 주세요. 한우 다짐육도 시장 정육점에서 조금씩 살 수 있어요.' },
  { author: 10, board: 'local', category: 'daily', title: '연남동 카페 중에 유모차 들어가는 곳', body: '입구 턱이 없고 안쪽이 넓어서 유모차 그대로 들어갈 수 있는 카페 몇 곳 정리해 봤어요. 주말 오전이 한산해요.' },
  { author: 11, board: 'local', category: 'question', title: '잠실 근처 영유아 수영 수업 있을까요?', body: '돌 지난 아기 물놀이 수업을 알아보고 있어요. 엄마랑 같이 들어가는 수업이면 좋겠어요.' },
  { author: 12, board: 'local', category: 'info', title: '송파구 출산 축하 지원 신청 방법 정리', body: '주민센터 방문하거나 온라인으로 신청할 수 있었어요. 출생신고 할 때 같이 안내해 주니 그때 물어보시면 편해요.' },
  { author: 13, board: 'local', category: 'recommend', title: '성수동 아기 의자 있는 식당 추천', body: '아기 의자 있고 직원분들이 친절한 식당 몇 군데 다녀왔어요. 이유식 데워 주는 곳도 있었어요.' },
  { author: 14, board: 'local', category: 'question', title: '아빠 육아휴직 써 보신 분 계세요?', body: '다음 달부터 육아휴직 들어가요. 처음이라 하루 일과를 어떻게 짜야 할지 막막하네요. 팁 부탁드려요!' },
  { author: 0, board: 'cohort', category: 'question', title: '6개월 아기 이유식 하루 몇 번 하세요?', body: '이제 막 초기 이유식 시작했어요. 하루 한 번으로 시작했는데 언제쯤 두 번으로 늘리셨나요?' },
  { author: 1, board: 'cohort', category: 'daily', title: '드디어 뒤집기 성공했어요!', body: '며칠째 끙끙대더니 오늘 혼자 뒤집었어요. 너무 신기해서 영상을 몇 개나 찍었는지 몰라요.' },
  { author: 5, board: 'cohort', category: 'info', title: '6개월 영유아 검진 다녀왔어요', body: '키, 몸무게 재고 발달 체크했어요. 검진 전에 문진표를 미리 작성해 가면 시간이 줄어요.' },
  { author: 2, board: 'cohort', category: 'question', title: '돌잔치 하시나요, 가족끼리만 하시나요?', body: '요즘은 가족끼리 식사만 하는 경우도 많다고 해서 고민이에요. 다들 어떻게 하셨어요?' },
  { author: 6, board: 'cohort', category: 'daily', title: '첫걸음마 뗐어요', body: '소파 잡고 서 있다가 두 발짝 걸었어요. 회사에서 영상으로 봤는데 눈물이 나더라고요.' },
  { author: 11, board: 'cohort', category: 'recommend', title: '돌 아기 컵 연습용 빨대컵 추천', body: '여러 개 써 봤는데 손잡이 있고 무게 추 달린 빨대컵이 제일 잘 쓰더라고요.' },
  { author: 3, board: 'cohort', category: 'question', title: '3개월 아기 밤잠 몇 시간 주무세요?', body: '밤에 3시간마다 깨서 수유하는데 다들 비슷한가요? 언제쯤 길게 자는지 궁금해요.' },
  { author: 8, board: 'cohort', category: 'daily', title: '100일 기념으로 가족사진 찍었어요', body: '집에서 셀프로 찍었는데 생각보다 잘 나왔어요. 백일상은 대여해서 간단하게 했어요.' },
  { author: 7, board: 'cohort', category: 'question', title: '9개월 아기 낮잠 두 번 자나요?', body: '요즘 오후 낮잠을 안 자려고 해서요. 낮잠 한 번으로 바뀌는 시기가 궁금해요.' },
  { author: 9, board: 'cohort', category: 'recommend', title: '9개월 아기 핑거푸드 레시피 공유해요', body: '찐 고구마를 길게 잘라 주니 잘 잡고 먹어요. 바나나 오트밀 팬케이크도 반응이 좋았어요.' },
  { author: 4, board: 'cohort', category: 'daily', title: '말이 트이기 시작했어요', body: '"엄마", "물" 정도만 하더니 요즘은 단어를 하나씩 따라 해요. 매일 새로운 단어가 나와서 신기해요.' },
  { author: 10, board: 'cohort', category: 'question', title: '18개월 양치 어떻게 시키세요?', body: '칫솔만 보면 도망가요. 양치 노래나 좋은 방법 있으면 알려 주세요.' },
];

// 댓글: post(SEED_POSTS 순서), author, body, (팩트 체크면 source)
export const SEED_COMMENTS = [
  { post: 0, author: 2, body: '목동역 근처에 저녁 9시까지 하는 소아과 있어요. 예약 앱으로 미리 접수하면 덜 기다려요.' },
  { post: 0, author: 3, body: '저도 궁금했는데 감사해요!' },
  { post: 0, author: 4, body: '야간·휴일에 문 여는 병원은 공공 안내 사이트에서 지역별로 찾을 수 있어요.', source: '응급의료포털(e-gen) 병·의원 찾기' },
  { post: 1, author: 0, body: '오 저도 가입해야겠어요. 정보 감사해요!' },
  { post: 2, author: 1, body: '파리공원 그늘 정말 좋죠. 다음엔 같이 산책해요~' },
  { post: 4, author: 2, body: '구립 실내 놀이터가 영아 구역이 따로 있어서 좋았어요.' },
  { post: 6, author: 5, body: '저는 6개월 정도 기다렸어요. 여러 곳에 대기 걸어 두세요.' },
  { post: 8, author: 6, body: '아기 잘 때 손톱 줄로 살살 갈아 주는 게 덜 무서웠어요.' },
  { post: 8, author: 7, body: '신생아 손톱은 얇아서 아기 전용 가위나 줄을 쓰라고 안내돼 있어요.', source: '보건복지부 아이사랑 육아정보' },
  { post: 14, author: 11, body: '오전 산책 하나만 고정해도 하루가 훨씬 수월해요. 화이팅이에요!' },
  { post: 15, author: 1, body: '저희는 2주 지나고 두 번으로 늘렸어요.' },
  { post: 15, author: 5, body: '이유식 진행 시기와 양은 아기 상태에 따라 다르니 검진 때 상담받아 보세요.', source: '국민건강보험공단 영유아 건강검진 안내' },
  { post: 16, author: 0, body: '축하해요!! 저희도 곧이겠죠?' },
  { post: 16, author: 5, body: '뒤집기 하면 이제 눈을 뗄 수가 없더라고요 ㅎㅎ' },
  { post: 18, author: 6, body: '저희는 가족끼리 식사하고 사진만 따로 찍었어요.' },
  { post: 19, author: 2, body: '감동이에요 ㅠㅠ 축하드려요!' },
  { post: 21, author: 8, body: '저희도 3시간마다 깨요. 같이 힘내요!' },
  { post: 23, author: 9, body: '저희 아기도 요즘 낮잠 한 번으로 넘어가는 중이에요.' },
  { post: 24, author: 7, body: '고구마 스틱 좋네요! 내일 해 볼게요.' },
  { post: 26, author: 4, body: '양치 노래 틀어주니까 조금 나아졌어요.' },
];

// 좋아요를 많이 받아 베스트가 될 글 (SEED_POSTS 순서)
export const BEST_POSTS = [2, 16];

// 중고 매물: seller(SEED_USERS 순서), image(scripts/seed-images 파일 이름)
export const SEED_USED_ITEMS = [
  { seller: 0, image: 'stroller', category: 'stroller', title: '절충형 유모차 (6개월 사용)', price: 180000, condition: 'good', size: null, usage: '6개월', description: '바퀴 상태 좋고 차양막 깨끗해요. 목동 직거래 원해요.' },
  { seller: 1, image: 'carseat', category: 'carseat', title: '회전형 카시트 신생아~4세', price: 95000, condition: 'like_new', size: '신생아~4세', usage: '8개월', description: '차를 바꾸면서 내놓아요. 커버 세탁 완료했어요.', status: 'reserved' },
  { seller: 2, image: 'carrier', category: 'carrier', title: '힙시트 아기띠 그레이', price: 30000, condition: 'good', size: null, usage: '1년', description: '허리 벨트 튼튼해요.' },
  { seller: 3, image: 'blocks', category: 'toy', title: '원목 블록 장난감 나눔해요', price: 0, condition: 'used', size: null, usage: '1년', description: '아이가 커서 나눔해요. 신정동에서 가져가실 분!' },
  { seller: 4, image: 'clothes', category: 'clothes', title: '아기 내복 80사이즈 5벌 일괄', price: 15000, condition: 'good', size: '80', usage: '6개월', description: '세탁해서 보관했어요.' },
  { seller: 5, image: 'feeding', category: 'feeding', title: '젖병 소독기 + 건조기', price: 40000, condition: 'good', size: null, usage: '1년', description: 'UV 램프 교체한 지 얼마 안 됐어요.' },
  { seller: 6, image: 'book', category: 'book', title: '전집 그림책 60권', price: 70000, condition: 'good', size: null, usage: '2년', description: '찢어진 곳 없이 깨끗해요. 무거워서 직거래만 가능해요.' },
  { seller: 7, image: 'bouncer', category: 'etc', title: '아기 바운서 (진동 기능)', price: 35000, condition: 'like_new', size: null, usage: '3개월', description: '아기가 별로 안 좋아해서 거의 안 썼어요.' },
  { seller: 9, image: 'highchair', category: 'feeding', title: '접이식 하이체어', price: 25000, condition: 'good', size: null, usage: '1년', description: '식판 분리돼서 세척 편해요.' },
  { seller: 10, image: 'shoes', category: 'clothes', title: '아기 첫걸음마 신발 130', price: 10000, condition: 'like_new', size: '130', usage: '1개월', description: '몇 번 안 신었어요.' },
  { seller: 11, image: 'bath', category: 'etc', title: '접이식 아기 욕조', price: 12000, condition: 'good', size: null, usage: '1년', description: '배수 마개 있어요.' },
  { seller: 13, image: 'toy', category: 'toy', title: '아기 체육관 놀이매트', price: 20000, condition: 'good', size: null, usage: '8개월', description: '모빌 장난감 전부 있어요.' },
];

// 채팅: item(SEED_USED_ITEMS 순서), buyer(SEED_USERS 순서), 메시지(구매자부터 번갈아), complete 면 거래 완료
export const SEED_CHATS = [
  { item: 0, buyer: 2, messages: ['안녕하세요! 유모차 아직 있나요?', '네 있어요~ 이번 주말 직거래 가능하세요?', '토요일 오전 괜찮아요!'] },
  { item: 1, buyer: 3, messages: ['카시트 예약 가능할까요?', '네 예약해 둘게요. 일요일에 뵐게요!'] },
  { item: 4, buyer: 0, messages: ['내복 구매하고 싶어요!', '네~ 목동역에서 거래해요', '감사합니다. 잘 입힐게요!'], complete: true },
];
