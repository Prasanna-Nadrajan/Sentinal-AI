"""Enhanced Explainable AI (XAI) engine for Sentinel AI Sepsis CDSS.

Produces structured feature attributions, clinical narratives,
and actionable insights mapped to Surviving Sepsis Campaign protocols.
"""

from __future__ import annotations

from collections import defaultdict
from typing import TYPE_CHECKING

import numpy as np
import pandas as pd

from .model_service import request_to_model_frame
from .schemas import (
    ClinicalInsight,
    Explanation,
    FeatureAttribution,
    PredictionRequest,
    RiskCategory,
    RiskDirection,
)

if TYPE_CHECKING:
    pass

# ---------------------------------------------------------------------------
# Reference Data
# ---------------------------------------------------------------------------

NORMAL_RANGES: dict[str, tuple[float, float, str, str]] = {
    "heart_rate": (60, 100, "bpm", "Heart Rate"),
    "temperature_c": (36.4, 37.6, "°C", "Temperature"),
    "oxygen_saturation": (95, 100, "%", "Oxygen Saturation"),
    "map": (70, 100, "mmHg", "MAP"),
    "respiratory_rate": (12, 20, "breaths/min", "Respiratory Rate"),
    "glucose": (70, 140, "mg/dL", "Glucose"),
    "wbc": (4, 11, "K/μL", "WBC"),
}

CLINICAL_PROTOCOL_MAP: dict[str, list[dict[str, str]]] = {
    "heart_rate": [
        {
            "condition": "elevated",
            "recommendation": "Assess for tachycardia etiology; consider fluid status evaluation and continuous cardiac monitoring.",
            "protocol": "Surviving Sepsis Campaign Hour-1 Bundle",
        },
        {
            "condition": "reduced",
            "recommendation": "Evaluate for bradycardic etiology; assess medication effects and cardiac conduction.",
            "protocol": "AHA Bradycardia Algorithm",
        },
    ],
    "temperature_c": [
        {
            "condition": "elevated",
            "recommendation": "Obtain blood cultures before initiating broad-spectrum antibiotics within 1 hour.",
            "protocol": "Surviving Sepsis Campaign Hour-1 Bundle",
        },
        {
            "condition": "reduced",
            "recommendation": "Evaluate for hypothermia-associated sepsis; consider active rewarming and blood cultures.",
            "protocol": "Surviving Sepsis Campaign Hour-1 Bundle",
        },
    ],
    "oxygen_saturation": [
        {
            "condition": "reduced",
            "recommendation": "Initiate supplemental oxygen to maintain SpO2 ≥ 94%; assess for respiratory failure.",
            "protocol": "Surviving Sepsis Campaign Hour-1 Bundle",
        },
    ],
    "map": [
        {
            "condition": "reduced",
            "recommendation": "Evaluate for IV fluid resuscitation (30 mL/kg crystalloid); consider vasopressor initiation if MAP < 65 mmHg after fluid challenge.",
            "protocol": "Surviving Sepsis Campaign Hour-1 Bundle — Hemodynamic Resuscitation",
        },
    ],
    "respiratory_rate": [
        {
            "condition": "elevated",
            "recommendation": "Assess for respiratory distress; consider arterial blood gas and chest imaging.",
            "protocol": "Surviving Sepsis Campaign — Organ Dysfunction Monitoring",
        },
    ],
    "glucose": [
        {
            "condition": "elevated",
            "recommendation": "Initiate insulin therapy protocol targeting glucose 140–180 mg/dL per ICU glycemic management.",
            "protocol": "Surviving Sepsis Campaign — Glycemic Control",
        },
        {
            "condition": "reduced",
            "recommendation": "Administer IV dextrose; monitor glucose every 1–2 hours until stable.",
            "protocol": "ADA Hypoglycemia Management",
        },
    ],
    "wbc": [
        {
            "condition": "elevated",
            "recommendation": "Obtain blood cultures and initiate empiric broad-spectrum antibiotics within 1 hour of recognition.",
            "protocol": "Surviving Sepsis Campaign Hour-1 Bundle — Antimicrobial Therapy",
        },
        {
            "condition": "reduced",
            "recommendation": "Evaluate for immunosuppression or marrow pathology; consider protective isolation and infectious disease consult.",
            "protocol": "Surviving Sepsis Campaign — Special Populations",
        },
    ],
}


# ---------------------------------------------------------------------------
# Internal Helpers
# ---------------------------------------------------------------------------

def _fmt_value(feature: str, value: float) -> str:
    """Format a feature value for display."""
    if feature in {"temperature_c", "wbc"}:
        return f"{value:.1f}"
    if feature in {"oxygen_saturation"}:
        return f"{value:.0f}"
    return f"{value:.0f}"


def _compute_direction(value: float, lo: float, hi: float) -> RiskDirection:
    """Determine whether a value is elevated, reduced, or normal."""
    if value > hi:
        return RiskDirection.elevated
    if value < lo:
        return RiskDirection.reduced
    return RiskDirection.normal


def _compute_z_score(value: float, lo: float, hi: float) -> float:
    """Compute a normalized z-score relative to the normal range."""
    center = (lo + hi) / 2
    half_width = (hi - lo) / 2
    return abs(value - center) / max(half_width, 1e-6)


def _direction_arrow(direction: RiskDirection) -> str:
    """Return an arrow symbol for the direction."""
    if direction == RiskDirection.elevated:
        return "↑"
    if direction == RiskDirection.reduced:
        return "↓"
    return "→"


def _factor_sentence(feature: str, value: float, high_risk: bool) -> str:
    """Legacy-format single-line factor description."""
    lo, hi, unit, label = NORMAL_RANGES[feature]
    if value < lo:
        direction = "Low"
    elif value > hi:
        direction = "High"
    else:
        direction = "Stable"

    if not high_risk and direction != "Stable":
        direction = "Improving"
    return f"{direction} {label} ({_fmt_value(feature, value)} {unit})"


# ---------------------------------------------------------------------------
# Feature Attribution Computation
# ---------------------------------------------------------------------------

def _get_raw_feature_values(payload: PredictionRequest) -> dict[str, float]:
    """Extract the vitals relevant to NORMAL_RANGES from a request."""
    return {
        "heart_rate": payload.heart_rate,
        "temperature_c": payload.temperature_c,
        "oxygen_saturation": payload.oxygen_saturation,
        "map": payload.map,
        "respiratory_rate": payload.respiratory_rate,
        "glucose": payload.glucose,
        "wbc": payload.wbc if payload.wbc is not None else 8.0,
    }


def _fallback_attributions(
    raw_features: dict[str, float],
    high_risk: bool,
) -> list[FeatureAttribution]:
    """Z-score–based feature importance when SHAP is unavailable."""
    attributions: list[FeatureAttribution] = []
    for feature, (lo, hi, unit, label) in NORMAL_RANGES.items():
        value = raw_features.get(feature)
        if value is None:
            continue
        z = _compute_z_score(value, lo, hi)
        if high_risk:
            score = z
        else:
            score = max(0.0, 2.0 - z)

        attributions.append(
            FeatureAttribution(
                feature_name=feature,
                display_name=label,
                raw_value=round(value, 2),
                unit=unit,
                normal_range_low=lo,
                normal_range_high=hi,
                importance_score=round(score, 4),
                direction=_compute_direction(value, lo, hi),
            )
        )
    attributions.sort(key=lambda a: a.importance_score, reverse=True)
    return attributions


def _shap_attributions(
    model: object,
    model_input: pd.DataFrame,
    payload: PredictionRequest,
    high_risk: bool,
) -> list[FeatureAttribution] | None:
    """Attempt SHAP-based attributions; return None on failure."""
    try:
        import shap  # type: ignore
    except Exception:
        return None

    try:
        preprocessor = model.steps[0][1]  # type: ignore[union-attr]
        estimator = model.steps[-1][1]  # type: ignore[union-attr]
        transformed = preprocessor.transform(model_input)
        transformed = transformed.toarray() if hasattr(transformed, "toarray") else transformed

        explainer = shap.TreeExplainer(estimator)
        shap_values = explainer.shap_values(transformed)

        if isinstance(shap_values, list):
            raw_values = shap_values[1][0]
        else:
            raw_values = shap_values[0]

        feature_names = preprocessor.get_feature_names_out(model_input.columns)
        grouped: dict[str, float] = defaultdict(float)
        for fname, sval in zip(feature_names, raw_values):
            if "__" in fname:
                base_name = fname.split("__", 1)[1].split("_", 1)[0]
            else:
                base_name = fname
            grouped[base_name] += float(abs(sval))

        model_to_raw: dict[str, str] = {
            "HR": "heart_rate",
            "Temp": "temperature_c",
            "O2Sat": "oxygen_saturation",
            "Resp": "respiratory_rate",
            "MAP": "map",
            "Glucose": "glucose",
        }

        raw_values_map = _get_raw_feature_values(payload)
        attributions: list[FeatureAttribution] = []

        for model_key, shap_score in grouped.items():
            raw_key = model_to_raw.get(model_key)
            if raw_key is None or raw_key not in NORMAL_RANGES:
                continue
            lo, hi, unit, label = NORMAL_RANGES[raw_key]
            value = raw_values_map[raw_key]
            attributions.append(
                FeatureAttribution(
                    feature_name=raw_key,
                    display_name=label,
                    raw_value=round(value, 2),
                    unit=unit,
                    normal_range_low=lo,
                    normal_range_high=hi,
                    importance_score=round(float(shap_score), 4),
                    direction=_compute_direction(value, lo, hi),
                )
            )

        # WBC isn't in the model features, add synthetically
        if payload.wbc is not None:
            lo, hi, unit, label = NORMAL_RANGES["wbc"]
            wbc_val = payload.wbc
            wbc_bonus = max((a.importance_score for a in attributions), default=0.1) * 0.8
            attributions.append(
                FeatureAttribution(
                    feature_name="wbc",
                    display_name=label,
                    raw_value=round(wbc_val, 2),
                    unit=unit,
                    normal_range_low=lo,
                    normal_range_high=hi,
                    importance_score=round(wbc_bonus, 4),
                    direction=_compute_direction(wbc_val, lo, hi),
                )
            )

        attributions.sort(key=lambda a: a.importance_score, reverse=True)
        return attributions if len(attributions) >= 3 else None

    except Exception:
        return None


def compute_feature_attributions(
    model: object,
    payload: PredictionRequest,
    probability: float,
    raw_features: dict[str, float],
) -> list[FeatureAttribution]:
    """Compute ranked feature attributions using SHAP or z-score fallback."""
    high_risk = probability >= 0.5
    model_input = request_to_model_frame(payload)

    shap_result = _shap_attributions(model, model_input, payload, high_risk)
    if shap_result is not None:
        return shap_result

    return _fallback_attributions(raw_features, high_risk)


# ---------------------------------------------------------------------------
# Clinical Narrative Generation
# ---------------------------------------------------------------------------

def generate_clinical_narrative(
    attributions: list[FeatureAttribution],
    probability: float,
    risk_category: RiskCategory,
) -> str:
    """Generate a human-readable summary of the patient's risk state."""
    if not attributions:
        return "Insufficient data to generate a clinical narrative."

    pct = round(probability * 100, 1)

    # Separate abnormal vs normal features
    abnormal = [a for a in attributions if a.direction != RiskDirection.normal]
    normal = [a for a in attributions if a.direction == RiskDirection.normal]

    parts: list[str] = []

    # Opening sentence
    if risk_category == RiskCategory.critical:
        parts.append(
            f"CRITICAL ALERT: Sepsis probability is {pct}%, indicating critical risk requiring immediate clinical intervention."
        )
    elif risk_category == RiskCategory.surveillance:
        parts.append(
            f"Elevated sepsis probability at {pct}%, warranting heightened surveillance and potential early intervention."
        )
    else:
        parts.append(
            f"Current sepsis probability is {pct}%, within stable parameters."
        )

    # Abnormal drivers
    if abnormal:
        top = abnormal[:3]
        driver_strs: list[str] = []
        for a in top:
            arrow = "high" if a.direction == RiskDirection.elevated else "low"
            driver_strs.append(f"{arrow} {a.display_name} ({a.raw_value} {a.unit})")
        drivers_text = ", ".join(driver_strs[:-1])
        if len(driver_strs) > 1:
            drivers_text += f" and {driver_strs[-1]}"
        else:
            drivers_text = driver_strs[0]
        parts.append(f"Risk is driven primarily by {drivers_text}.")

    # Stable reassurance
    if normal:
        stable_names = [a.display_name for a in normal[:3]]
        if len(stable_names) == 1:
            parts.append(f"{stable_names[0]} remains within normal range.")
        else:
            parts.append(
                f"{', '.join(stable_names[:-1])} and {stable_names[-1]} remain within normal ranges."
            )

    return " ".join(parts)


# ---------------------------------------------------------------------------
# Clinical Insight Generation (SSC Protocol Mapping)
# ---------------------------------------------------------------------------

def generate_clinical_insights(
    attributions: list[FeatureAttribution],
) -> list[ClinicalInsight]:
    """Map the top abnormal features to Surviving Sepsis Campaign recommendations."""
    insights: list[ClinicalInsight] = []
    seen_features: set[str] = set()

    for attr in attributions:
        if attr.direction == RiskDirection.normal:
            continue
        if attr.feature_name in seen_features:
            continue

        protocols = CLINICAL_PROTOCOL_MAP.get(attr.feature_name, [])
        direction_str = attr.direction.value  # "elevated" or "reduced"

        for proto in protocols:
            if proto["condition"] == direction_str:
                insights.append(
                    ClinicalInsight(
                        trigger_feature=attr.display_name,
                        recommendation=proto["recommendation"],
                        protocol_reference=proto["protocol"],
                    )
                )
                seen_features.add(attr.feature_name)
                break

    return insights


# ---------------------------------------------------------------------------
# Risk Category Determination
# ---------------------------------------------------------------------------

def determine_risk_category(probability: float) -> RiskCategory:
    """Map probability to a tri-level risk category."""
    if probability >= 0.7:
        return RiskCategory.critical
    if probability >= 0.5:
        return RiskCategory.surveillance
    return RiskCategory.stable


# ---------------------------------------------------------------------------
# Public Orchestrators
# ---------------------------------------------------------------------------

def build_explanation(
    model: object,
    payload: PredictionRequest,
    probability: float,
    raw_features: dict[str, float],
) -> Explanation:
    """Build the complete structured Explanation for a prediction."""
    risk_category = determine_risk_category(probability)
    attributions = compute_feature_attributions(model, payload, probability, raw_features)
    narrative = generate_clinical_narrative(attributions, probability, risk_category)
    insights = generate_clinical_insights(attributions)

    return Explanation(
        feature_attributions=attributions,
        clinical_narrative=narrative,
        clinical_insights=insights,
        risk_category=risk_category,
    )


def top_factors_for_prediction(
    model: object,
    payload: PredictionRequest,
    probability: float,
    raw_features: dict[str, float],
) -> list[str]:
    """Backward-compatible: return top 3 factor strings."""
    high_risk = probability >= 0.5
    attributions = compute_feature_attributions(model, payload, probability, raw_features)
    return [
        _factor_sentence(a.feature_name, a.raw_value, high_risk)
        for a in attributions[:3]
    ]
