# Project INSE: 기술 구현 상세 보고서

본 문서는 Project INSE MVP의 기술적 아키텍처와 핵심 알고리즘 구현 내용을 노션 형식으로 정리한 기술 리포트입니다.

---

## 1. 시스템 아키텍처 및 기술 스택
Next.js 14+ 프레임워크 기반의 Full-stack 구조로 설계되었습니다.

*   **Frontend**: React 19, TypeScript, Tailwind CSS
    *   **Editor**: `@monaco-editor/react`를 활용한 실시간 코드 편집기 구현.
    *   **Charts**: `recharts`를 이용한 역량 지표 및 레이더 차트 시각화.
*   **Backend**: Next.js App Router (Route Handlers)
*   **Storage**: Local File System Persistence (JSON/JSONL)
    *   **Sessions**: 개별 세션 메타데이터 저장 (.json)
    *   **Events**: 대용량 행동 로그를 Append-only 방식으로 기록 (.jsonl)

---

## 2. 데이터 모델링 (Strict Entity Schema)
타 시스템과의 연동 및 데이터 정합성을 위해 제공된 ERD를 기반으로 인터페이스를 정의했습니다.

*   **Identities**: UUID v4 표준을 사용한 고유 식별자 관리.
*   **IdeEvent**: `event_type`, `timestamp`, `payload` 구조로 모든 사용자 행위를 정규화.
*   **Report & Metrics**: 세션 종료 후 분석 결과와 세부 지표를 1:N 관계로 관리.

---

## 3. 핵심 백엔드 로직: Scoring Engine
수집된 행동 로그(`IdeEvent`)를 시계열로 분석하여 정량적 점수를 도출합니다.

### A. Progress Score (점진적 개선도)
*   **알고리즘**: `TEST` 이벤트의 `pass_rate` 시퀀스를 분석합니다.
*   **계산 방식**: 이전 테스트 대비 성공률의 변화 폭을 누적 계산하여, 솔루션이 정답에 수렴하고 있는지를 판별합니다.

### B. Evidence Responsiveness (피드백 반응성)
*   **알고리즘**: 특정 실패 이벤트 이후 발생하는 후속 행동 패턴을 조사합니다.
*   **유효 패턴**: `TEST(FAIL) -> AI_CALL(DEBUG) -> CODE_EDIT -> TEST(RE-RUN)`
*   **기술 구현**: 실패 지점으로부터 일정 시간(또는 이벤트 윈도우) 내에 위 패턴이 완성되는 횟수를 가중치로 합산합니다.

### C. Loop Productivity (생산적 루프 비율)
*   **알고리즘**: 시도 횟수 대비 결과 개선의 효율을 측정합니다.
*   **계산 방식**: `SUCCESS` 상태로 전환되거나 `pass_rate`가 유의미하게 상승한 루프의 수를 전체 시도 수로 나누어 산출합니다.

---

## 4. 데이터 신뢰도 산출 (Confidence Score)
분석된 리포트의 결론이 얼마나 신뢰할 수 있는지를 0-100 점수로 평가합니다.

*   **데이터 밀도 분석**: 총 로그 이벤트 수가 최소 임계값(10개) 미만일 경우 차감.
*   **부정 행위 감지**: `code_edit` 페이로드의 `delta_chars`를 모니터링하여, 짧은 시간 내 대량의 텍스트가 삽입(복사-붙여넣기)될 경우 신뢰도를 대폭 차감.
*   **연속성 분석**: 이벤트 간의 시간 간격을 체크하여, 15분 이상의 데이터 공백이 발생할 경우 가중치를 낮춤.

---

## 5. API API 인터페이스 상세
*   **POST /api/session**: 세션 생성 및 초기 `task_id` 할당.
*   **POST /api/events**: IDE 내 모든 행위를 비동기로 수집 및 저장.
*   **GET /api/report/[id]**: 시계열 로그 로드 -> Scoring Engine 가동 -> Report/Metric 객체 생성 및 반환.

---
**작성일**: 2026-01-29  
**담당**: Antigravity AI Assistant  
**문서 상태**: Final (Strict Schema Applied)
