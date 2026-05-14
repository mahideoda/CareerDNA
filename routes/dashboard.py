from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from models.schemas import DashboardResponse, DashboardRecentItem
from services.resume_store import resume_store


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(settings: Settings = Depends(get_settings)) -> DashboardResponse:
    items = resume_store.list_recent(limit=50)
    total = resume_store.count()
    scores = [i.score.overall for i in items] if items else []
    avg = round(sum(scores) / len(scores), 2) if scores else None

    bands = {"80-100": 0, "60-79": 0, "40-59": 0, "0-39": 0}
    for s in scores:
        if s >= 80:
            bands["80-100"] += 1
        elif s >= 60:
            bands["60-79"] += 1
        elif s >= 40:
            bands["40-59"] += 1
        else:
            bands["0-39"] += 1

    recent = [
        DashboardRecentItem(
            id=i.id,
            filename=i.filename,
            overall_score=i.score.overall,
            created_at=i.created_at,
        )
        for i in items[:10]
    ]

    return DashboardResponse(
        total_uploads=total,
        average_overall_score=avg,
        recent=recent,
        score_distribution=bands,
        meta={"app": settings.app_name},
    )
