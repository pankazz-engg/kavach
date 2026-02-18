"""
POST /anomaly
Isolation Forest anomaly detection endpoint
"""

from fastapi import APIRouter
import numpy as np

from app.schemas.schemas import AnomalyRequest, AnomalyResponse
from app.features.engineering import features_to_array, FEATURE_NAMES
from app.models.loader import get_models

router = APIRouter()


@router.post("", response_model=AnomalyResponse)
async def detect_anomaly(request: AnomalyRequest):
    features_dict = request.features.model_dump()
    X = features_to_array(features_dict)

    models = get_models()

    if not models:
        return AnomalyResponse(
            wardId=request.wardId,
            isAnomaly=False,
            anomalyScore=0.0,
            anomalyFeatures=[],
        )

    scaler = models["scaler"]
    X_scaled = scaler.transform(X)

    iso = models["iso_forest"]
    prediction = iso.predict(X_scaled)[0]       # 1 = normal, -1 = anomaly
    score = float(iso.decision_function(X_scaled)[0])  # lower = more anomalous
    is_anomaly = prediction == -1

    # Identify which features are most anomalous (simple z-score approach)
    anomaly_features = []
    if is_anomaly:
        # Features with highest deviation from training mean
        feature_values = X[0]
        # Use scaler mean/std to compute z-scores
        z_scores = np.abs((feature_values - scaler.mean_) / (scaler.scale_ + 1e-8))
        top_indices = np.argsort(z_scores)[::-1][:3]
        anomaly_features = [FEATURE_NAMES[i] for i in top_indices]

    return AnomalyResponse(
        wardId=request.wardId,
        isAnomaly=is_anomaly,
        anomalyScore=round(score, 4),
        anomalyFeatures=anomaly_features,
    )
