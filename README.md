# INSE MVP

## 개요
이 저장소는 `frontend/`에 위치한 풀스택(React SPA + Express API) 프로젝트입니다.

- 개발 환경에서는 Vite 개발 서버(포트 `8080`)에 Express 서버를 미들웨어로 붙여 **프론트/백엔드를 단일 포트로** 실행합니다.
- 배포 환경에서는 정적 SPA(`dist/spa`) + Netlify Functions(`netlify/functions`) 구성을 사용하며, `/api/*` 요청은 Netlify Function으로 리다이렉트됩니다.

## 기술 스택
- **Frontend**: React 18, React Router 6, TypeScript, Vite, TailwindCSS
- **Backend**: Express (Vite dev server에 미들웨어로 통합)
- **Serverless(배포)**: Netlify Functions + `serverless-http`
- **State/Fetch**: TanStack React Query
- **Test**: Vitest

## 프로젝트 구조
```
frontend/
  client/                 # React SPA
  server/                 # Express API
  shared/                 # client/server에서 공용으로 사용하는 타입/유틸
  netlify/
    functions/            # Netlify Functions 엔트리
  vite.config.ts          # Vite(dev) 설정 + Express 미들웨어 플러그인
  vite.config.server.ts   # 서버(Express) 번들 빌드 설정
  netlify.toml            # Netlify build/functions/redirect 설정
```

## 요구 사항
- Node.js (서버 빌드 타깃이 `node22`로 설정되어 있어 **Node 22 권장**)
- 패키지 매니저: `pnpm` 권장 (프로젝트에 `pnpm-lock.yaml` 및 `packageManager`가 설정되어 있음)

## 로컬 실행
아래 명령어는 `frontend/` 디렉토리에서 실행합니다.

### 설치
```bash
pnpm install
```

### 개발 서버 실행
```bash
pnpm dev
```

- 기본 접속: `http://localhost:8080`
- API는 `/api/*` 프리픽스를 사용합니다.

## 빌드 / 프로덕션 실행
### 전체 빌드(클라이언트 + 서버)
```bash
pnpm build
```

### 서버 실행(프로덕션 번들)
```bash
pnpm start
```

## 테스트 / 타입체크
```bash
pnpm test
pnpm typecheck
```

## 환경 변수
현재 `frontend/.env`에 아래 값들이 정의되어 있습니다.

- `VITE_PUBLIC_BUILDER_KEY`
- `PING_MESSAGE`

주의:
- `VITE_`로 시작하는 값은 Vite를 통해 **클라이언트 번들에 포함**될 수 있습니다.
- 민감정보(Secret)는 `.env`에 커밋하지 말고, 배포 환경(Netlify/Vercel 등)의 환경변수 설정을 사용하세요.

## Netlify 배포
`frontend/netlify.toml` 기준:

- **Build command**: `npm run build:client`
- **Publish directory**: `dist/spa`
- **Functions directory**: `netlify/functions`
- **Redirects**: `/api/*` -> `/.netlify/functions/api/:splat`

Netlify Function 엔트리는 `frontend/netlify/functions/api.ts`이며, `serverless-http`로 Express 앱(`createServer()`)을 감싸서 동작합니다.

## 주요 라우팅(프론트)
SPA 라우팅은 `frontend/client/App.tsx`에서 관리합니다.

## 상태
- `README.md` 추가 완료
