export type SessionStatus = 'active' | 'submitted' | 'abandoned';
export type AssessmentStatus = 'draft' | 'published' | 'archived';

// Management Layer
export interface Recruiter {
  recruiter_id: string; // UUID
  name: string;
  company: string;
}

export interface Dashboard {
  dashboard_id: string; // UUID
  recruiter_id: string; // FK
}

export interface Assessment {
  assessment_id: string; // UUID
  recruiter_id: string; // FK
  title: string;
  level: string;
  duration_minutes: number;
  status: AssessmentStatus;
}

export interface Task {
  task_id: string; // UUID
  assessment_id: string; // FK
  title: string;
  description: string;
  language: string;
  time_limit: number;
}

export interface Candidate {
  candidate_id: string; // UUID
  name: string;
  email: string;
}

// Session Layer
export interface Session {
  session_id: string; // UUID
  candidate_id: string; // FK
  task_id: string; // FK
  started_at: string; // datetime
  ended_at?: string; // datetime
  status: SessionStatus;
}

// Logging Layer
export interface ProjectFile {
  project_file_id: string; // UUID
  session_id: string; // FK
  path: string;
  file_name: string;
  content: string;
}

export interface IdeEvent {
  ide_event_id: string; // UUID
  session_id: string; // FK
  timestamp: string; // datetime (ISO)
  event_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export interface AiInteraction {
  ai_interaction_id: string; // UUID
  ide_event_id: string; // FK
  prompt: string;
  response: string;
  model_name: string;
  latency_ms: number;
  in_token: number;
  out_token: number;
}

export interface CodeRun {
  code_run_id: string; // UUID
  session_id: string; // FK
  run_id: string; // UUID (internal run identifier)
  started_at: string; // datetime
  ended_at: string; // datetime
  exit_code: number;
  stdout: string;
  stderr: string;
}

// Analysis Layer
export interface Report {
  report_id: string; // UUID
  session_id: string; // FK
  overall_score: number;
  ai_reliance: number;
  debugging_score: number;
  confidence: number; // Added: Consistency/Data Reliability score
}

export interface Metric {
  metric_id: string; // UUID
  report_id: string; // FK
  name: string;
  value: number;
  weight: number;
  time?: number;
  completed?: boolean;
}
