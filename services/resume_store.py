from __future__ import annotations

import threading
from dataclasses import dataclass
from datetime import datetime, timezone

from models.schemas import ResumeScoreBreakdown


@dataclass
class StoredResume:
    id: str
    filename: str
    stored_path: str
    text: str
    score: ResumeScoreBreakdown
    created_at: datetime


class ResumeStore:
    """Process-local store for parsed resumes (replace with DB in production)."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._items: dict[str, StoredResume] = {}

    def put(self, item: StoredResume) -> None:
        with self._lock:
            self._items[item.id] = item

    def get(self, resume_id: str) -> StoredResume | None:
        with self._lock:
            return self._items.get(resume_id)

    def list_recent(self, limit: int = 20) -> list[StoredResume]:
        with self._lock:
            items = sorted(self._items.values(), key=lambda x: x.created_at, reverse=True)
        return items[:limit]

    def count(self) -> int:
        with self._lock:
            return len(self._items)


resume_store = ResumeStore()
