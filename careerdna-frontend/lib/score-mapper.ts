import type { ResumeScoreBreakdown, ResumeUploadResponse } from "@/lib/types";

/** Product-facing labels mapped from backend heuristics. */
export type UiScores = {
  readiness: number;
  ats: number;
  impact: number;
  clarity: number;
  overall: number;
};

/**
 * Maps API breakdown to dashboard UI axes.
 * - Readiness → structure / completeness signals
 * - ATS match → keyword relevance
 * - Impact → blend of depth + overall momentum
 * - Clarity → content depth (substance / length proxy)
 */
export function mapScoresToUi(score: ResumeScoreBreakdown): UiScores {
  const impact = Math.min(
    100,
    Math.round(score.content_depth * 0.55 + score.overall * 0.45),
  );
  const clarity = score.content_depth;
  return {
    readiness: score.structure_signals,
    ats: score.keyword_relevance,
    impact,
    clarity,
    overall: score.overall,
  };
}

export function radarSeriesFromUpload(upload: ResumeUploadResponse) {
  const ui = mapScoresToUi(upload.score);
  return [
    { subject: "ATS match", value: ui.ats, fullMark: 100 },
    { subject: "Readiness", value: ui.readiness, fullMark: 100 },
    { subject: "Clarity", value: ui.clarity, fullMark: 100 },
    { subject: "Impact", value: ui.impact, fullMark: 100 },
    { subject: "Overall", value: ui.overall, fullMark: 100 },
  ];
}
