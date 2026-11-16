// 대표 페이지에서 다른 서비스로 보내는 주소. 배포 주소가 정해지면 Vercel 환경 변수로 바꾼다.

// 구매자 앱 웹 버전 (EAS Hosting). 고정 주소(mompick.expo.app)로 올리면 그 주소로 바꾼다.
export const APP_WEB_URL = process.env.NEXT_PUBLIC_APP_WEB_URL || "https://mompick--mwb6k3uwi0.expo.app";

// 판매자 센터 가입 화면. 판매자 웹을 배포하기 전에는 비워 두고, 버튼은 "준비 중"으로 보인다.
export const SELLER_SIGNUP_URL = process.env.NEXT_PUBLIC_SELLER_SIGNUP_URL || "";

export const TERMS_URL = `${APP_WEB_URL}/legal/terms`;
export const PRIVACY_URL = `${APP_WEB_URL}/legal/privacy`;
