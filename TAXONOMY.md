# INSE Event Taxonomy

이 문서는 INSE 세션 동안 발생하는 모든 행동(Action)에 대한 분류 체계(Taxonomy)를 정의합니다. 모든 행동은 아래의 12가지 유형 중 하나로 고정되어 기록되어야 합니다.

## 행동 수집 가이드라인

### 1. CODE_EDIT
- **정의**: 코드 텍스트를 사용자가 직접 편집
- **발생 조건**: 코드 텍스트 박스에 직접 키보드 입력을 통해 내용이 변경된 경우 (Copy & Paste 제외)
- **좋은 예시**: 적극적인 디버깅 (Active Debugging) 과정에서 코드를 수정함
- **나쁜 예시**: AI가 생성한 코드를 그대로 복사하기만 하고 직접적인 `CODE_EDIT` 횟수가 매우 적음

### 2. TEST_PASS
- **정의**: 모든 테스트 케이스(TC)를 성공적으로 통과
- **발생 조건**: 실행된 모든 테스트 케이스가 만점을 받았을 때 발동
- **예시**: N/A

### 3. TEST_FAIL
- **정의**: 테스트 케이스 일부 또는 전부 실패
- **발생 조건**: 실행된 테스트 케이스 중 하나라도 실패하거나 점수가 깎였을 때 발동
- **예시**: N/A

### 4. RUN_SUCCEED
- **정의**: 구문 오류(Syntax Error) 없이 코드가 성공적으로 실행됨
- **발생 조건**: 모든 테스트 케이스의 입력에 대해 컴파일/실행 에러 없이 결과가 도출된 경우
- **예시**: N/A

### 5. GENERATE_CODE_AI
- **정의**: AI에게 코드 작성을 직접적으로 요구
- **발생 조건**: 프롬프트의 의도가 코드 생성이며, AI의 응답 결과가 코드 위주인 경우
- **예시**:
    - **Prompt**: Develop a XXX algorithm code for me
    - **Output**: Here is a XXX algorithm code: ...

### 6. DEBUG_CODE_AI
- **정의**: AI에게 디버깅을 직접 요구
- **발생 조건**: 프롬프트에 "Debug", "Fix" 등의 단어가 포함되어 있으며 코드 수정을 요청한 경우
- **예시**:
    - **Prompt**: Debug lines 50 ~ 85
    - **Output**: Here is the debugged code: ...

### 7. ASK_AI
- **정의**: 직접적인 코드 수정을 요청하지 않는 질의
- **발생 조건**: 응답 결과에 수정 가능한 코드가 포함되지 않는 경우
- **예시**:
    - **Prompt**: What are some ways to overcome TLE in XXX algorithm?
    - **Output**: Here are potential methodologies: ...

### 8. SYNTAX_ERROR
- **정의**: 문법 오류로 인해 실행이 실패한 경우
- **발생 조건**: 실행 결과 `SyntaxError` 또는 이에 준하는 컴파일 에러가 발생한 경우
- **예시**: N/A

### 9. TIME_LENGTH_EXCEEDED (TLE)
- **정의**: 시간 초과로 인한 실행 에러
- **발생 조건**: 설정된 실행 제한 시간(Time Limit)을 초과하여 프로세스가 강제 종료된 경우
- **예시**: N/A

### 10. LEAVE_TAB
- **정의**: 세션 진행 중 다른 탭이나 창으로 이동을 시도
- **발생 조건**: 브라우저 창의 포커스를 잃은 경우 (Focus Lost)
- **예시**: N/A

### 11. END_SESSION
- **정의**: 사용자가 세션 종료(제출)를 명시적으로 클릭한 경우
- **발생 조건**: "Submit" 또는 "End Session" 버튼 클릭 시
- **예시**: N/A

### 12. TIME_UP
- **정의**: 할당된 전체 Task 수행 시간 초과
- **발생 조건**: 전체 가용 시간이 종료되어 세션이 자동 마감된 경우
- **예시**: N/A
