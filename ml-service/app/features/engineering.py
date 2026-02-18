"""
Feature engineering utilities for the ML service.
Converts the raw feature vector from Node backend into
model-ready numpy arrays.
"""

import numpy as np
from typing import Dict, Any


# Ordered feature names — must match training order
FEATURE_NAMES = [
    "totalAdmissions7d",
    "totalAdmissions48h",
    "dailyAvg7d",
    "syndromeSpike48h",
    "chlorineDropRatio",
    "currentChlorine",
    "currentTurbidity",
    "phDeviation",
    "lagRainfall1d",
    "avgRainfall7d",
    "rainfallSpike",
    "avgTemp7d",
    "avgHumidity7d",
    "citizenClusterCount",
    "citizenSeverityScore",
    # Syndrome one-hot
    "syndrome_DIARRHEA",
    "syndrome_FEVER",
    "syndrome_VOMITING",
    "syndrome_COUGH",
    "syndrome_RESPIRATORY_DISTRESS",
    "syndrome_SKIN_RASH",
    "syndrome_JAUNDICE",
]

# Human-readable feature labels for SHAP/Insight Box
FEATURE_LABELS = {
    "totalAdmissions7d":         "Total hospital admissions (7d)",
    "totalAdmissions48h":        "Hospital admissions (48h)",
    "dailyAvg7d":                "Daily admission average (7d)",
    "syndromeSpike48h":          "Syndrome spike multiplier (48h vs baseline)",
    "chlorineDropRatio":         "Chlorine level drop ratio",
    "currentChlorine":           "Current chlorine level (mg/L)",
    "currentTurbidity":          "Current water turbidity (NTU)",
    "phDeviation":               "pH deviation from neutral",
    "lagRainfall1d":             "Yesterday's rainfall (mm)",
    "avgRainfall7d":             "Average rainfall (7d, mm)",
    "rainfallSpike":             "Rainfall spike detected",
    "avgTemp7d":                 "Average temperature (7d, °C)",
    "avgHumidity7d":             "Average humidity (7d, %)",
    "citizenClusterCount":       "Citizen complaint cluster count (24h)",
    "citizenSeverityScore":      "Citizen report severity score",
    "syndrome_DIARRHEA":         "Diarrhea cases reported",
    "syndrome_FEVER":            "Fever cases reported",
    "syndrome_VOMITING":         "Vomiting cases reported",
    "syndrome_COUGH":            "Cough cases reported",
    "syndrome_RESPIRATORY_DISTRESS": "Respiratory distress cases",
    "syndrome_SKIN_RASH":        "Skin rash cases reported",
    "syndrome_JAUNDICE":         "Jaundice cases reported",
}

SYNDROME_KEYS = [
    "DIARRHEA", "FEVER", "VOMITING", "COUGH",
    "RESPIRATORY_DISTRESS", "SKIN_RASH", "JAUNDICE",
]

SYNDROME_TO_CATEGORY = {
    "DIARRHEA":             "WATERBORNE",
    "VOMITING":             "FOODBORNE",
    "FEVER":                "VECTOR_BORNE",
    "COUGH":                "AIRBORNE",
    "RESPIRATORY_DISTRESS": "AIRBORNE",
    "SKIN_RASH":            "VECTOR_BORNE",
    "JAUNDICE":             "WATERBORNE",
    "HEADACHE":             "VECTOR_BORNE",
    "UNKNOWN":              "UNKNOWN",
}


def features_to_array(features: Dict[str, Any]) -> np.ndarray:
    """Convert feature dict to ordered numpy array for model inference."""
    syndrome_breakdown = features.get("syndromeBreakdown", {})
    total_syndrome = sum(syndrome_breakdown.values()) or 1

    row = [
        features.get("totalAdmissions7d", 0),
        features.get("totalAdmissions48h", 0),
        features.get("dailyAvg7d", 0),
        features.get("syndromeSpike48h", 0),
        features.get("chlorineDropRatio", 0),
        features.get("currentChlorine", 0.5),
        features.get("currentTurbidity", 2.0),
        features.get("phDeviation", 0),
        features.get("lagRainfall1d", 0),
        features.get("avgRainfall7d", 0),
        float(features.get("rainfallSpike", False)),
        features.get("avgTemp7d", 28),
        features.get("avgHumidity7d", 70),
        features.get("citizenClusterCount", 0),
        features.get("citizenSeverityScore", 1),
        # Syndrome proportions (one-hot-ish)
        *[syndrome_breakdown.get(s, 0) / total_syndrome for s in SYNDROME_KEYS],
    ]
    return np.array(row, dtype=np.float32).reshape(1, -1)


def get_dominant_syndrome(syndrome_breakdown: Dict[str, float]) -> str:
    """Returns the syndrome type with the highest count."""
    if not syndrome_breakdown:
        return "UNKNOWN"
    return max(syndrome_breakdown, key=syndrome_breakdown.get)


def get_outbreak_category(syndrome_breakdown: Dict[str, float]) -> str:
    dominant = get_dominant_syndrome(syndrome_breakdown)
    return SYNDROME_TO_CATEGORY.get(dominant, "UNKNOWN")
