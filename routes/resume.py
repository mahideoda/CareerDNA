import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.config import Settings, get_settings
from models.schemas import ResumeUploadResponse
from services.pdf_parser import extract_text_from_pdf
from services.resume_store import StoredResume, resume_store
from services.scoring_engine import score_resume_text
from utils.storage import save_upload_bytes


router = APIRouter(prefix="/resume", tags=["resume"])

_ALLOWED = {".pdf"}


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(..., description="Resume PDF"),
    settings: Settings = Depends(get_settings),
) -> ResumeUploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    suffix = ""
    if "." in file.filename:
        suffix = "." + file.filename.rsplit(".", 1)[-1].lower()
    if suffix not in _ALLOWED:
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    data = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large (max {settings.max_upload_mb} MB)",
        )

    stored = save_upload_bytes(settings.upload_dir, file.filename, data)

    try:
        text = extract_text_from_pdf(stored)
    except Exception as exc:  # noqa: BLE001 — surface parse errors to client
        stored.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {exc}") from exc

    score = score_resume_text(text)
    rid = uuid.uuid4().hex
    now = datetime.now(timezone.utc)
    resume_store.put(
        StoredResume(
            id=rid,
            filename=file.filename,
            stored_path=str(stored),
            text=text,
            score=score,
            created_at=now,
        )
    )

    preview = text[:500] + ("…" if len(text) > 500 else "")
    words = text.split()
    return ResumeUploadResponse(
        id=rid,
        filename=file.filename,
        stored_path=str(stored),
        text_preview=preview,
        word_count=len(words),
        score=score,
        created_at=now,
    )
