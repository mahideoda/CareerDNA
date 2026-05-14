import type { ResumeUploadResponse } from "@/lib/types";
import { mapScoresToUi } from "@/lib/score-mapper";

export type RecruiterInsight = {
  title: string;
  detail: string;
  tone: "positive" | "neutral" | "watch";
};

export function buildRecruiterInsights(upload: ResumeUploadResponse): RecruiterInsight[] {
  const ui = mapScoresToUi(upload.score);
  const insights: RecruiterInsight[] = [];

  insights.push({
    title: "First-pass signal",
    detail:
      ui.ats >= 70
        ? "Strong keyword alignment versus common role taxonomies — good ATS surfacing potential."
        : "Keyword footprint looks thin versus typical postings — tighten role-relevant terms and outcomes.",
    tone: ui.ats >= 70 ? "positive" : "watch",
  });

  insights.push({
    title: "Scanability",
    detail:
      ui.readiness >= 70
        ? "Structure cues (sections / contact) read clearly for a quick recruiter skim."
        : "Add clearer sectioning and contact signals to reduce friction in a 6-second skim.",
    tone: ui.readiness >= 70 ? "positive" : "neutral",
  });

  insights.push({
    title: "Substance",
    detail:
      ui.clarity >= 65
        ? "Extracted content length suggests enough material to support depth in interview."
        : "Consider expanding quantified outcomes and scope to strengthen narrative depth.",
    tone: ui.clarity >= 65 ? "positive" : "neutral",
  });

  const preview = upload.text_preview.replace(/\s+/g, " ").trim();
  if (preview.length > 40) {
    insights.push({
      title: "Snippet check",
      detail: `Preview anchor: “${preview.slice(0, 160)}${preview.length > 160 ? "…" : ""}”`,
      tone: "neutral",
    });
  }

  return insights;
}
