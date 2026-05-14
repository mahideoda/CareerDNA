from fastapi import APIRouter

from routes.dashboard import router as dashboard_router
from routes.resume import router as resume_router

api_router = APIRouter(prefix="/api")
api_router.include_router(resume_router)
api_router.include_router(dashboard_router)

__all__ = ["api_router"]
