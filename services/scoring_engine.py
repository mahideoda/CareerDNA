import re
from dataclasses import dataclass

from models.schemas import ResumeScoreBreakdown

# Curated keyword buckets for a generic tech/professional resume signal.
_KEYWORD_BUCKETS: list[tuple[str, list[str]]] = [
    ("engineering", ["python", "java", "typescript", "javascript", "go", "rust", "c++", "sql", "api", "aws", "kubernetes", "docker", "ci/cd", "git"]),
    ("data", ["machine learning", "data science", "pandas", "numpy", "spark", "etl", "analytics", "statistics"]),
    ("leadership", ["led", "managed", "mentor", "stakeholder", "cross-functional", "strategy", "roadmap"]),
    ("impact", ["increased", "reduced", "improved", "saved", "%", "revenue", "growth", "latency", "throughput"]),
]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _keyword_score(text: str) -> float:
    if not text:
        return 0.0
    n = _normalize(text)
    hits = 0
    total = 0
    for _, words in _KEYWORD_BUCKETS:
        for w in words:
            total += 1
            if w in n:
                hits += 1
    if total == 0:
        return 0.0
    return min(100.0, (hits / total) * 100.0 * 4.0)  # scale up; cap at 100


def _content_depth_score(text: str) -> float:
    words = re.findall(r"[A-Za-z0-9+/]+", text)
    wc = len(words)
    if wc < 50:
        return max(0.0, wc / 50.0 * 40.0)
    if wc < 200:
        return 40.0 + (wc - 50) / 150.0 * 35.0
    return min(100.0, 75.0 + min(25.0, (wc - 200) / 400.0 * 25.0))


def _structure_score(text: str) -> float:
    if not text:
        return 0.0
    n = _normalize(text)
    score = 0.0
    if re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I):
        score += 25
    if any(k in n for k in ["experience", "employment", "work history", "professional experience"]):
        score += 25
    if any(k in n for k in ["education", "degree", "university", "college"]):
        score += 25
    if any(k in n for k in ["skills", "technical skills", "competencies"]):
        score += 25
    return min(100.0, score)


@dataclass(frozen=True)
class ScoreWeights:
    keyword: float = 0.4
    depth: float = 0.35
    structure: float = 0.25


def score_resume_text(text: str, weights: ScoreWeights | None = None) -> ResumeScoreBreakdown:
    w = weights or ScoreWeights()
    kw = _keyword_score(text)
    depth = _content_depth_score(text)
    struct = _structure_score(text)
    overall = kw * w.keyword + depth * w.depth + struct * w.structure
    return ResumeScoreBreakdown(
        keyword_relevance=round(kw, 2),
        content_depth=round(depth, 2),
        structure_signals=round(struct, 2),
        overall=round(overall, 2),
    )
