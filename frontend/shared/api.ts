/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type UUID = string;

export interface Recruiter {
  recruiter_id: UUID;
  name: string;
  company: string;
}

export interface Dashboard {
  dashboard_id: UUID;
  recruiter_id: UUID;
}

export type AssessmentStatus = "draft" | "active" | "archived";

export interface Assessment {
  assessment_id: UUID;
  recruiter_id: UUID;
  title: string;
  level: string;
  duration_minutes: number;
  status: AssessmentStatus;
}

export interface Task {
  task_id: UUID;
  assessment_id: UUID;
  title: string;
  description: string;
  language: string;
  time_limit: number;
}

export interface Candidate {
  candidate_id: UUID;
  name: string;
  email: string;
}

export type SessionStatus = "created" | "in_progress" | "completed" | "expired";

export interface Session {
  session_id: UUID;
  candidate_id: UUID;
  task_id: UUID;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
}

export interface Report {
  report_id: UUID;
  session_id: UUID;
  overall_score: number;
  ai_reliance: number;
  debugging_score: number;
}

export interface Metric {
  metric_id: UUID;
  report_id: UUID;
  name: string;
  value: number;
  weight: number;
  time: number;
  completed: boolean;
}

export interface ProjectFile {
  project_file_id: UUID;
  session_id: UUID;
  path: string;
  file_name: string;
  content: string;
}

export interface IdeEvent {
  ide_event_id: UUID;
  session_id: UUID;
  timestamp: string;
  event_type: string;
  payload: Record<string, unknown>;
}

export interface AiInteraction {
  ai_interaction_id: UUID;
  ide_event_id: UUID;
  prompt: string;
  response: string;
  model_name: string;
  latency_ms: number;
  in_token: number;
  out_token: number;
}

export interface CodeRun {
  code_run_id: UUID;
  session_id: UUID;
  run_id: UUID;
  started_at: string;
  ended_at: string | null;
  exit_code: number;
  stdout: string;
  stderr: string;
}
