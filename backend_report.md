# Project INSE 백엔드 구현 보고서

이 보고서는 Project INSE의 MVP 백엔드 시스템 아키텍처 및 구현 상세 내용을 한국어로 설명합니다. 본 시스템은 지원자의 코딩 과정 데이터를 수집하고 이를 분석하여 채용 담당자에게 정량적인 리포트를 제공하는 것을 목적으로 합니다.

## 1. 기술 스택 (Tech Stack)
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Database**: Local JSON-based Persistence (MVP 단계에서의 빠른 프로토타이핑 및 이식성 확보)
*   **ID Generation**: UUID (v4)

## 2. 데이터 모델링 (Strict Schema)
사용자가 제공한 ER 다이어그램을 기반으로 모든 엔티티를 인터페이스화하여 `lib/types.ts`에 정의했습니다. 이를 통해 타 시스템과의 연동 시 데이터 정합성을 보장합니다.

*   **Management Layer**: `Recruiter`, `Assessment`, `Task`, `Candidate`
*   **Session Layer**: `Session` (지원자의 한 번의 평가 세션 관리)
*   **Logging Layer**: `IdeEvent` (코드 편집, 실행, AI 호출 등 모든 행동 로그), `AiInteraction`, `CodeRun`
*   **Analysis Layer**: `Report`, `Metric` (최종 평가 결과 및 세부 지표)

## 3. 데이터베이스 처리 (`lib/db.ts`)
MVP의 기동성을 위해 별도의 외부 DB 설치 없이 로컬 파일 시스템을 활용하는 데이터 레이어를 구축했습니다.

*   **Session Storage**: `data/sessions/[id].json`에 개별 세션 정보 저장.
*   **Event Logging**: `data/events/[session_id].jsonl` 파일에 이벤트 데이터를 행 단위(JSONL)로 Append하여 대용량 로그 기록 시 성능 최적화.
*   **Abstraction**: `db` 객체를 통해 추상화되어 있어, 추후 `lib/db.ts` 교체만으로 PostgreSQL이나 Supabase로 즉시 전환 가능합니다.

## 4. API 엔드포인트 구현
Next.js API Routes를 사용하여 RESTful한 인터페이스를 제공합니다.

### A. 세션 관리 (`/api/session`)
*   **POST**: 새로운 평가 세션을 생성합니다. 신규 스키마 규격에 따라 `task_id`를 필수로 할당합니다.
*   **GET**: 특정 세션의 상세 정보 또는 전체 세션 목록을 반환합니다.

### B. 행동 로그 수집 (`/api/events`)
*   **POST**: 지원자의 IDE 상의 모든 이벤트를 수집합니다.
*   **Data Mapping**: 프론트엔드에서 넘어온 Action을 스키마 규격인 `IdeEvent`로 변환하고, ISO 8601 형식의 타임스탬프를 부여하여 저장합니다.

### C. 평가 리포트 생성 (`/api/report/[sessionId]`)
*   **GET**: 해당 세션의 모든 로그를 불러와 실시간으로 채점 엔진을 가동하고, 최종 `Report`와 `Metric` 리스트를 반환합니다.

## 5. 채점 엔진 로직 (`lib/scoring.ts`)
로그 데이터를 기반으로 지원자의 역량을 수치화하는 핵심 비즈니스 로직입니다.

1.  **Planning Signal (PS)**: 첫 AI 인터페이스 사용 시 'plan', 'approach' 등 전략적 키워드 포함 여부 분석.
2.  **Iterative Solving (IPS / Debugging)**: `Run(Fail) -> Edit -> Run(Pass/Edit)` 패턴을 추적하여 문제 해결 능력을 점수화.
3.  **AI Reliance**: AI 호출 빈도와 코드 수정량의 상관관계를 분석하여 AI 의존도를 산출.
4.  **Efficiency (EFF)**: 전체 작업 소요 시간과 성공률을 조합하여 효율성 측정.

## 6. 특징 및 장점
*   **엄격한 타입 준수**: 사용자가 정의한 ERD와 1:1로 매핑되는 타입을 사용하여 데이터 신뢰도를 높였습니다.
*   **확장성**: `IdeEvent` 내의 `payload`를 JSON 타입으로 선언하여, 추후 새로운 IDE 기능이 추가되어도 스키마 변경 없이 데이터 수집이 가능합니다.
*   **정교한 타임라인**: 모든 이벤트에 고정밀 타임스탬프를 부여하여 채용 담당자가 지원자의 사고 과정을 시간 순으로 복기할 수 있도록 설계했습니다.
