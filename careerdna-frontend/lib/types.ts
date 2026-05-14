/** Mirrors FastAPI `ResumeScoreBreakdown`. */
export type ResumeScoreBreakdown = {
  keyword_relevance: number;
  content_depth: number;
  structure_signals: number;
  overall: number;
};

export type ResumeUploadResponse = {
  id: string;
  filename: string;
  stored_path: string;
  text_preview: string;
  word_count: number;
  score: ResumeScoreBreakdown;
  created_at: string;
};

export type DashboardRecentItem = {
  id: string;
  filename: string;
  overall_score: number;
  created_at: string;
};

export type DashboardResponse = {
  total_uploads: number;
  average_overall_score: number | null;
  recent: DashboardRecentItem[];
  score_distribution: Record<string, number>;
  meta: Record<string, unknown>;
};

export type ApiErrorBody = {
  detail?: string | { loc?: unknown[]; msg?: string; type?: string }[];
};
