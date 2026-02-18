"""
Model loader — loads trained models from disk at startup.
Uses a singleton pattern so models are only loaded once.
"""

import os
import joblib
import logging

logger = logging.getLogger(__name__)

SAVED_DIR = os.path.join(os.path.dirname(__file__), "saved")

_models = {}


def load_models():
    """Load all models from disk. Called once at FastAPI startup."""
    global _models
    try:
        _models = {
            "classifier": joblib.load(os.path.join(SAVED_DIR, "xgb_classifier.pkl")),
            "regressor":  joblib.load(os.path.join(SAVED_DIR, "xgb_regressor.pkl")),
            "iso_forest": joblib.load(os.path.join(SAVED_DIR, "isolation_forest.pkl")),
            "scaler":     joblib.load(os.path.join(SAVED_DIR, "scaler.pkl")),
        }
        logger.info("✅ ML models loaded successfully")
    except FileNotFoundError:
        logger.warning(
            "⚠️  Trained models not found. Run 'python -m app.models.train' first. "
            "Falling back to rule-based scoring."
        )
        _models = {}
    return _models


def get_models():
    if not _models:
        load_models()
    return _models
