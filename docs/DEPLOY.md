# 배포·DB 작업 방법

## 계정·프로젝트
- **Expo(EAS) 프로젝트**: `@koreawnstj12abc/mompick` (projectId `ee67da75-47f0-4a1d-b85e-c50bc9309e90`) — https://expo.dev/accounts/koreawnstj12abc/projects/mompick
- **Supabase 프로젝트**: MomPick, ref `otbegcnauueufxlrsxqo`, 리전 ap-southeast-2(시드니). CLI 는 맨 위 폴더에서 이미 연결됨 (`supabase/.temp/project-ref`).
- **GitHub**: https://github.com/JunseoPark543/MomPick (main 브랜치)

## 비밀 값 위치
- `apps/mobile/.env.local` (Git 제외): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — 앱에 들어가는 공개 값만. 형식은 `apps/mobile/.env.example`.
- **EAS 클라우드 빌드용**: 같은 두 값을 EAS 환경 변수(development·preview·production)에 등록해 둠. `eas.json` 의 각 프로필이 `environment` 로 연결.
- DB 비밀번호는 Supabase CLI 가 이 컴퓨터에만 저장. 저장소·앱에는 없음.

## DB 변경 (맨 위 폴더에서)
1. `supabase/migrations/<YYYYMMDDHHMMSS>_설명.sql` 새 파일 작성 (RLS·권한 포함)
2. `npm run db:push` — 운영 DB 에 적용 (**먼저 사용자에게 알림**)
3. `npm run db:types` — `packages/shared/src/database.types.ts` 다시 만들기
4. `npm run db:status` — 적용 기록 확인
- 01~11 번은 대시보드에서 수동 적용 후 `supabase migration repair --status applied` 로 기록함 (2026-11-16).

## 구매자 웹 (EAS Hosting) — `apps/mobile` 폴더에서
```
npx expo export --platform web
npx eas-cli@latest deploy            # 미리보기 주소 (배포마다 바뀜)
npx eas-cli@latest deploy --prod     # 고정 주소 (아직 안 함)
```
- `app.json` 의 `web.output` 은 `static` (EAS Hosting 요구).
- 최근 미리보기: https://mompick--mwb6k3uwi0.expo.app (2026-11-16)

## 안드로이드 테스트 앱 (APK) — `apps/mobile` 폴더에서
```
npx eas-cli@latest build -p android --profile preview
```
- 끝나면 expo.dev 빌드 페이지에 설치 링크·QR. 첫 빌드: 2026-11-13 (versionCode 1), 이후 모노레포 이동 전 코드 기준.
- 서명 키(keystore)는 Expo 서버가 보관.
- 무료 요금제는 월 빌드 횟수 제한·대기 시간이 있으니 꼭 필요할 때만.

## 예시 데이터
- `npm run seed` (맨 위 폴더). 가짜 회원 비밀번호는 `scripts/seed-accounts.local.json`(Git 제외).
