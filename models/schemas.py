from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ResumeScoreBreakdown(BaseModel):
    """Individual scoring dimensions (0–100 each, combined into overall)."""

    keyword_relevance: float = Field(..., ge=0, le=100, description="Match to in-demand skills/keywords")
    content_depth: float = Field(..., ge=0, le=100, description="Length and substance of extracted text")
    structure_signals: float = Field(..., ge=0, le=100, description="Heuristic signals for sections and contact info")
    overall: float = Field(..., ge=0, le=100, description="Weighted overall score")


class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    stored_path: str
    text_preview: str
    word_count: int
    score: ResumeScoreBreakdown
    created_at: datetime


class DashboardRecentItem(BaseModel):
    id: str
    filename: str
    overall_score: float
    created_at: datetime


class DashboardResponse(BaseModel):
    total_uploads: int
    average_overall_score: float | None
    recent: list[DashboardRecentItem]
    score_distribution: dict[str, int] = Field(
        default_factory=dict,
        description="Counts by band: e.g. 80-100, 60-79, ...",
    )
    meta: dict[str, Any] = Field(default_factory=dict)
