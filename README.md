# INSE MVP

## 개요
이 프로젝트는 AI 기반의 코딩 테스트 플랫폼 **INSE**의 MVP 버전입니다. 후보자의 코딩 과정(편집, 실행, AI 인터뷰)을 실시간으로 추적하고, 이를 기반으로 다각도의 역량 지표(AEQ, IPS, EFF)를 자동으로 산출합니다.

- **Frontend**: React + Vite 기반의 IDE 환경
- **Backend**: FastAPI(Python) 기반의 코드 실행 및 AI 엔진 & 데이터 가공
- **Database**: Supabase(PostgreSQL) 기반의 실시간 이벤트 로깅 및 리포트 저장

## 주요 기능
- **실시간 IDE**: Python 코드 편집 및 실행, 테스트 케이스 검증
- **AI 인터뷰**: Google Gemini 기반의 지능형 코딩 어시스턴트
- **데이터 파이프라인**: 모든 사용자 액션을 세션별로 Supabase에 실시간 적재
- **자동 채점 엔진**: 시험 종료 시 로그를 분석하여 3대 핵심 지표 산출
  - **AEQ (Algorithmic Efficiency Quotient)**: 알고리즘 정확도 및 성능 지표
  - **IPS (Iterative Problem Solving)**: 오류 해결 및 디버깅 역량 지표
  - **EFF (Efficiency)**: AI 활용도 및 코드 작성 효율성 지표

## 기술 스택
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons
- **Backend**: FastAPI, Psycopg 3 (Connection Pooling), Google Generative AI (Gemini)
- **Database**: Supabase (PostgreSQL)

## 프로젝트 구조
```text
Backend/
  main.py                 # 백엔드 통합 엔트리 (API, DB, AI, Scoring)
  requirements.txt        # Python 의존성
frontend/
  client/                 # React IDE 프론트엔드
    pages/Index.tsx       # 메인 IDE 인터페이스 및 로깅 로직
  server/                 # Express API (미들웨어)
```

## 시작하기

### 1. Backend 설정
`Backend/` 디렉토리에서 작업합니다.

**요구 사항**: Python 3.10+

```bash
# 가상환경 생성 및 활성화
python -m venv .venv
./.venv/Scripts/activate  # Windows
source .venv/bin/activate # macOS/Linux

# 의존성 설치
pip install -r requirements.txt
```

**환경 변수 (.env)**:
```env
GOOGLE_API_KEY=your_gemini_api_key
DATABASE_URL=your_supabase_postgresql_url
```

**서버 실행**:
```bash
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend 설정
`frontend/` 디렉토리에서 작업합니다.

**요구 사항**: Node.js 22+, `pnpm` 권장

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```
- 접속 주소: `http://localhost:8080`

## 데이터베이스 스키마
프로젝트는 Supabase의 `public` 스키마 아래 다음 테이블들을 사용합니다:
- `candidates`: 후보자 정보
- `tasks`: 문제 정보
- `sessions`: 시험 세션 정보
- `ide_events`: 모든 사용자 행위 로그 (JSONB 페이로드)
- `ai_interactions`: AI 대화 상세 기록
- `reports`: 최종 산출된 역량 점수 및 리포트
- `metrics`: 세부 지표 데이터

## 라이선스
Copyright © 2024 INSE AI. All rights reserved.
