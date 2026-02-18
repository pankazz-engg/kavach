"""
POST /predict
Main prediction endpoint — runs XGBoost + SHAP + Outbreak Reason Generator
"""

from fastapi import APIRouter
import shap
import numpy as np

from app.schemas.schemas import PredictRequest, PredictResponse, ShapReason
from app.features.engineering import (
    features_to_array, FEATURE_NAMES, FEATURE_LABELS, get_outbreak_category
)
from app.features.reason_generator import generate_outbreak_reasons, shap_to_reasons
from app.models.loader import get_models

router = APIRouter()


@router.post("", response_model=PredictResponse)
async def predict(request: PredictRequest):
    features_dict = request.features.model_dump()
    X = features_to_array(features_dict)

    models = get_models()

    # ── ML Inference ──────────────────────────────────────────────────────────
    if models:
        scaler = models["scaler"]
        X_scaled = scaler.transform(X)

        # Risk score (0–1)
        risk_score = float(np.clip(models["regressor"].predict(X_scaled)[0], 0, 1))

        # Anomaly detection
        iso_score = models["iso_forest"].decision_function(X_scaled)[0]
        is_anomaly = bool(models["iso_forest"].predict(X_scaled)[0] == -1)

        # SHAP explainability
        explainer = shap.TreeExplainer(models["classifier"])
        shap_values = explainer.shap_values(X_scaled)

        # For binary classifier shap_values may be list[2]; take class-1 values
        sv = shap_values[1] if isinstance(shap_values, list) else shap_values
        sv_flat = sv[0].tolist()

        # Build ShapReason objects
        shap_reasons = []
        paired = sorted(zip(FEATURE_NAMES, sv_flat), key=lambda x: abs(x[1]), reverse=True)
        for feat, impact in paired[:5]:
            shap_reasons.append(ShapReason(
                feature=feat,
                value=float(X[0][FEATURE_NAMES.index(feat)]),
                impact=round(impact, 4),
                direction="increases" if impact > 0 else "decreases",
            ))

        # SHAP-derived text reasons (top 3)
        shap_text = shap_to_reasons(sv_flat, FEATURE_NAMES, FEATURE_LABELS)
        confidence = float(models["classifier"].predict_proba(X_scaled)[0][1])
        source = "ml"

    else:
        # Fallback: rule-based scoring
        from app.services.fallback import rule_based_predict
        result = rule_based_predict(features_dict)
        risk_score = result["riskScore"]
        is_anomaly = result["isAnomaly"]
        confidence = result["confidence"]
        shap_reasons = []
        shap_text = []
        source = "fallback"

    # ── Outbreak Category from syndrome breakdown ─────────────────────────────
    outbreak_category = get_outbreak_category(features_dict.get("syndromeBreakdown", {}))

    # ── Outbreak Reason Generator (AI Insight Box) ────────────────────────────
    rule_reasons = generate_outbreak_reasons(features_dict)
    all_reasons = rule_reasons + shap_text  # rule-based first, SHAP enriches

    return PredictResponse(
        wardId=request.wardId,
        riskScore=round(risk_score, 3),
        outbreakCategory=outbreak_category,
        confidence=round(confidence, 3),
        isAnomaly=is_anomaly,
        forecastHorizon=request.forecastHorizon,
        shapReasons=shap_reasons,
        outbreakReasons=all_reasons,
        source=source,
    )
