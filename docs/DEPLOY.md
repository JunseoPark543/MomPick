# 배포·DB 작업 방법

## 계정·프로젝트
- **Expo(EAS) 프로젝트**: `@koreawnstj12abc/mompick` (projectId `ee67da75-47f0-4a1d-b85e-c50bc9309e90`) — https://expo.dev/accounts/koreawnstj12abc/projects/mompick
- **Supabase 프로젝트**: MomPick, ref `otbegcnauueufxlrsxqo`, 리전 ap-southeast-2(시드니). CLI 는 맨 위 폴더에서 이미 연결됨 (`supabase/.temp/project-ref`).
- **GitHub**: https://github.com/JunseoPark543/MomPick (main 브랜치)

## 도메인 (mompik.com, 2026-11-16 가비아에서 구매, 네임서버는 가비아 기본)
| 주소 | 연결할 곳 | Vercel 프로젝트 Root Directory |
|---|---|---|
| `mompik.com`, `www.mompik.com` | 대표 페이지 | `apps/web` |
| `app.mompik.com` | 구매자 앱 웹 버전 | `apps/mobile` (`apps/mobile/vercel.json` 사용) |
| `seller.mompik.com` | 판매자 웹 | `apps/seller` |
| `admin.mompik.com` | 관리자 웹 | `apps/admin` |
- **Vercel 프로젝트** (계정 junseopark543): `mompik-web`, `mompik-app`, `mompik-seller`, `mompik-admin` — GitHub `main` 에 올리면 자동 배포. 임시 주소 `https://<프로젝트>.vercel.app`
- **가비아 DNS 기록** (2026-11-16 Vercel 이 알려 준 값):

  | 타입 | 호스트 | 값 |
  |---|---|---|
  | A | @ | 216.198.79.1 |
  | A | @ | 64.29.17.1 |
  | CNAME | www | 0fc43d185c2a5213.vercel-dns-017.com. |
  | CNAME | app | a9d74b01c312fd51.vercel-dns-017.com. |
  | CNAME | seller | 74c646872bc68188.vercel-dns-017.com. |
  | CNAME | admin | e78c34fb4465b9e8.vercel-dns-017.com. |
  - 확인: `npx vercel@latest domains verify <주소>`
- **연결 확인 완료 (2026-11-16, Codex)**: 5개 도메인 모두 DNS 기록 일치, Vercel `domains verify` 결과 `ok`·`configured-correctly`, HTTPS 접속 200. `www.mompik.com` 은 `https://mompik.com/` 으로 308 이동.
- 웹 4개 모두 **Vercel** (EAS Hosting 은 내 도메인 연결이 유료 요금제라서). 가비아 → DNS 관리에서 Vercel 이 알려 주는 기록(A·CNAME)을 넣는다.
- Vercel 환경 변수: Next.js 3개는 `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`(관리자·판매자), 대표 페이지는 `NEXT_PUBLIC_APP_WEB_URL=https://app.mompik.com`, `NEXT_PUBLIC_SELLER_SIGNUP_URL=https://seller.mompik.com/signup`. 구매자 웹은 `EXPO_PUBLIC_SUPABASE_URL`·`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- 구매자 웹의 번호가 들어가는 주소(`/post/123` 등)는 `apps/mobile/vercel.json` 의 rewrites 로 `post/[id].html` 에 연결. 배포 후 실제로 열어 확인할 것.
- Vercel 무료(Hobby) 요금제는 **비상업용**이 조건이다. 정식 서비스(수익 발생) 전에는 Pro 로 바꾼다.

## 비밀 값 위치
- `apps/mobile/.env.local` (Git 제외): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — 앱에 들어가는 공개 값만. 형식은 `apps/mobile/.env.example`.
- **EAS 클라우드 빌드용**: 같은 두 값을 EAS 환경 변수(development·preview·production)에 등록해 둠. `eas.json` 의 각 프로필이 `environment` 로 연결.
- DB 비밀번호·secret 키는 앱 환경 변수에 넣지 않는다. CLI 로컬 인증 정보·저장소 밖에서만 관리한다.
- `apps/mobile/.env.local` 의 과거 `SUPABASE_PW` 줄 삭제 여부는 아직 사용자 확인 필요(`docs/BACKLOG.md`). 이 파일의 비밀 값은 출력하거나 커밋하지 않는다.

## DB 변경 (맨 위 폴더에서)
1. `supabase/migrations/<YYYYMMDDHHMMSS>_설명.sql` 새 파일 작성 (RLS·권한 포함)
2. `npm run db:push` — 운영 DB 에 적용 (**먼저 사용자에게 알림**)
3. `npm run db:types` — `packages/shared/src/database.types.ts` 다시 만들기
4. `npm run db:status` — 적용 기록 확인
- 01~11 번은 대시보드에서 수동 적용 후 `supabase migration repair --status applied` 로 기록함 (2026-11-16).

## 구매자 웹 (EAS Hosting 옛 미리보기) — `apps/mobile` 폴더에서
```
npx expo export --platform web
npx eas-cli@latest deploy            # 미리보기 주소 (배포마다 바뀜)
npx eas-cli@latest deploy --prod     # 고정 주소 (아직 안 함)
```
- `app.json` 의 `web.output` 은 `static` (EAS Hosting 요구).
- 최근 미리보기: https://mompick--mwb6k3uwi0.expo.app (2026-11-16)
- 현재 배포 주소는 **https://app.mompik.com** (Vercel). 위 EAS 명령은 옛 미리보기 참고용이며, 정리 여부는 아직 결정 전.

## 안드로이드 테스트 앱 (APK) — `apps/mobile` 폴더에서
```
npx eas-cli@latest build -p android --profile preview
```
- 끝나면 expo.dev 빌드 페이지에 설치 링크·QR. 첫 빌드: 2026-11-13 (versionCode 1), 이후 모노레포 이동 전 코드 기준.
- 서명 키(keystore)는 Expo 서버가 보관.
- 무료 요금제는 월 빌드 횟수 제한·대기 시간이 있으니 꼭 필요할 때만.

## 관리자 웹 (`apps/admin`)
- 비밀 값: `apps/admin/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (구매자 앱과 같은 공개 값. 형식은 `.env.example`). secret 키는 넣지 않는다.
- 내 컴퓨터에서: 맨 위 폴더에서 `npm run admin` → http://localhost:3001
- **관리자 계정 등록**: 첫 계정은 사용자가 가입 후 Supabase SQL Editor 에서 직접 등록 완료(2026-11-16, DB 관리자 1명 확인). 추가 등록도 사용자 승인 없이 실행하지 않는다. 방법: 가입한 계정 이메일을 아래 SQL 에 넣고 SQL Editor 에서 실행(실제 이메일은 저장소 문서에 적지 않는다).
  ```sql
  insert into public.admin_users (user_id, note)
  select id, '관리자' from auth.users where email = '<이메일>';
  ```
- **Vercel 배포 완료**: 프로젝트 `mompik-admin`, Root Directory `apps/admin`, 주소 https://admin.mompik.com. GitHub `main` 자동 배포.
- 관리자 로그인·검증용 업체 반려는 사용자 확인 완료(2026-11-16). 작업 기록 누락 수정(`20261116131456`) 운영 적용 완료. 이전 누락 기록은 복원하지 않으며 이후 변경부터 기록한다.
- 작업 기록 회귀 검사: `npx supabase db query --remote --file scripts/check-admin-actions.sql --yes`. 실행 전 운영 DB 검사임을 사용자에게 알린다. 등록된 관리자와 검증용 업체 대표가 필요하며, 관리자 변경 기록·변경 전후 값·일반 회원 권한을 검사하고 마지막에 시험 변경과 기록을 모두 원복한다.

## 판매자 웹 (`apps/seller`)
- 비밀 값: `apps/seller/.env.local` — 관리자 웹과 같은 두 공개 값 (`.env.example` 참고).
- 내 컴퓨터에서: 맨 위 폴더에서 `npm run seller` → http://localhost:3002
- **Vercel 배포 완료**: 프로젝트 `mompik-seller`, Root Directory `apps/seller`, 주소 https://seller.mompik.com. GitHub `main` 자동 배포.
- 배포 주소에서 seed01 로그인·현재 업체 상태(반려) 안내를 실제 Chrome 으로 확인(2026-11-16). 상품·사진·배송 처리는 관리자 웹에서 테스트 업체를 활동으로 바꾼 뒤 검증 필요.

## 대표 페이지 (`apps/web`)
- 내 컴퓨터에서: 맨 위 폴더에서 `npm run web` → http://localhost:3000
- 환경 변수: Vercel 에 `NEXT_PUBLIC_APP_WEB_URL=https://app.mompik.com`, `NEXT_PUBLIC_SELLER_SIGNUP_URL=https://seller.mompik.com/signup` 등록 완료. 로컬에서 생략하면 아직 코드 기본값은 옛 EAS 미리보기·입점 준비 중이므로, 현재 주소로 확인하려면 두 값을 설정한다.
- **Vercel 배포 완료**: 프로젝트 `mompik-web`, Root Directory `apps/web`, 주소 https://mompik.com. GitHub `main` 자동 배포.

## 예시 데이터
- `npm run seed` (맨 위 폴더). 가짜 회원 비밀번호는 `scripts/seed-accounts.local.json`(Git 제외).
