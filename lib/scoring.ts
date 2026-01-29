import { IdeEvent, Report, Metric } from './types';
import { v4 as uuidv4 } from 'uuid';

export function calculateReport(sessionId: string, events: IdeEvent[]): { report: Report; metrics: Metric[] } {
    // Sort events by timestamp just in case
    const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const testEvents = sortedEvents.filter(e => e.event_type === 'run' || e.event_type === 'test');
    const aiEvents = sortedEvents.filter(e => e.event_type === 'ai_call');

    // --- 지표 1: Progress Score (개선 방향성) ---
    let progressScore = 50;
    if (testEvents.length >= 2) {
        let improvementCount = 0;
        for (let i = 1; i < testEvents.length; i++) {
            const prev = testEvents[i - 1].payload.pass_rate || (testEvents[i - 1].payload.status === 'SUCCESS' ? 1 : 0);
            const curr = testEvents[i].payload.pass_rate || (testEvents[i].payload.status === 'SUCCESS' ? 1 : 0);

            if (curr > prev) improvementCount++;
            else if (curr < prev) improvementCount--;
        }
        progressScore += (improvementCount * 15);
    }

    // --- 지표 2: Evidence Responsiveness (실패 반응성) ---
    let responsivenessScore = 50;
    let matches = 0;
    for (let i = 0; i < sortedEvents.length - 3; i++) {
        const e = sortedEvents[i];
        // FAIL -> AI_DEBUG -> EDIT -> TEST
        if ((e.event_type === 'run' || e.event_type === 'test') && e.payload.status === 'FAIL') {
            const nextActions = sortedEvents.slice(i + 1, i + 4).map(ev => ev.event_type);
            if (nextActions.includes('ai_call') && nextActions.includes('code_edit')) {
                matches++;
            }
        }
    }
    responsivenessScore += (matches * 20);

    // --- 지표 3: Loop Productivity (생산적 루프 비율) ---
    let loopProductivity = 50;
    if (testEvents.length > 0) {
        const productiveLoops = testEvents.filter((e, idx) => {
            if (idx === 0) return false;
            const prev = testEvents[idx - 1].payload.pass_rate || 0;
            const curr = e.payload.pass_rate || 0;
            return curr > prev;
        }).length;
        loopProductivity = (productiveLoops / testEvents.length) * 100;
    }

    // --- Confidence (신뢰도) ---
    let confidence = 100;
    if (events.length < 10) confidence -= 30; // 로그 부족

    // 대량 복붙 감지 (단일 code_edit에서 delta_chars가 매우 큰 경우 - payload 설계에 따라 다름)
    const bulkEdits = sortedEvents.filter(e => e.event_type === 'code_edit' && (e.payload.length_delta || 0) > 500);
    if (bulkEdits.length > 0) confidence -= 40;

    // 과정 로그 단절 (시간 간격 체크)
    for (let i = 1; i < sortedEvents.length; i++) {
        const gap = new Date(sortedEvents[i].timestamp).getTime() - new Date(sortedEvents[i - 1].timestamp).getTime();
        if (gap > 1000 * 60 * 15) { // 15분 이상 공백
            confidence -= 10;
            break;
        }
    }

    // --- 최종 점수 산출 ---
    const reportId = uuidv4();
    const criticalUsageScore = (progressScore * 0.4) + (responsivenessScore * 0.3) + (loopProductivity * 0.3);

    const report: Report = {
        report_id: reportId,
        session_id: sessionId,
        overall_score: Math.min(100, Math.max(0, criticalUsageScore)),
        ai_reliance: Math.min(100, aiEvents.length * 10),
        debugging_score: Math.min(100, Math.max(0, responsivenessScore)),
        confidence: Math.min(100, Math.max(0, confidence))
    };

    const metrics: Metric[] = [
        { metric_id: uuidv4(), report_id: reportId, name: 'Progress Score', value: Math.min(100, Math.max(0, progressScore)), weight: 0.4 },
        { metric_id: uuidv4(), report_id: reportId, name: 'Evidence Responsiveness', value: Math.min(100, Math.max(0, responsivenessScore)), weight: 0.3 },
        { metric_id: uuidv4(), report_id: reportId, name: 'Loop Productivity', value: Math.min(100, Math.max(0, loopProductivity)), weight: 0.3 },
    ];

    return { report, metrics };
}
