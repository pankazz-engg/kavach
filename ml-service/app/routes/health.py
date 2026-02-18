from fastapi import APIRouter
from app.models.loader import get_models
import os

router = APIRouter()


@router.get("/health")
async def health():
    models = get_models()
    return {
        "status": "ok",
        "service": "kavach-ml",
        "modelsLoaded": bool(models),
        "models": list(models.keys()) if models else [],
    }
