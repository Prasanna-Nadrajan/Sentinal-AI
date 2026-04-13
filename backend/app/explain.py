from __future__ import annotations

from collections import defaultdict

import numpy as np
import pandas as pd

from .model_service import request_to_model_frame
from .schemas import PredictionRequest

NORMAL_RANGES = {
    "heart_rate": (60, 100, "bpm", "Heart Rate"),
    "temperature_c": (36.4, 37.6, "C", "Temperature"),
    "oxygen_saturation": (95, 100, "%", "Oxygen Saturation"),
    "map": (70, 100, "mmHg", "MAP"),
    "respiratory_rate": (12, 20, "breaths/min", "Respiratory Rate"),
    "glucose": (70, 140, "mg/dL", "Glucose"),
    "wbc": (4, 11, "K/uL", "WBC"),
}


def _fmt_value(feature: str, value: float) -> str:
    if feature in {"temperature_c"}:
        return f"{value:.1f}"
    if feature in {"oxygen_saturation"}:
        return f"{value:.0f}"
    if feature in {"wbc"}:
        return f"{value:.1f}"
    return f"{value:.0f}"


def _factor_sentence(feature: str, value: float, high_risk: bool) -> str:
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


def _fallback_local_importance(raw_features: dict[str, float], high_risk: bool) -> list[str]:
    scored: list[tuple[float, str]] = []
    for feature, (lo, hi, _, _) in NORMAL_RANGES.items():
        value = raw_features.get(feature)
        if value is None:
            continue
        center = (lo + hi) / 2
        half_width = (hi - lo) / 2
        z_score = abs(value - center) / max(half_width, 1e-6)
        if high_risk:
            score = z_score
        else:
            # for low-risk cases, reward closeness to normal range
            score = max(0.0, 2.0 - z_score)
        scored.append((score, _factor_sentence(feature, value, high_risk)))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [text for _, text in scored[:3]]


def _shap_local_importance(
    model,
    model_input: pd.DataFrame,
    payload: PredictionRequest,
    high_risk: bool,
) -> list[str]:
    try:
        import shap  # type: ignore
    except Exception:
        return []

    try:
        preprocessor = model.steps[0][1]
        estimator = model.steps[-1][1]
        transformed = preprocessor.transform(model_input)
        transformed = transformed.toarray() if hasattr(transformed, "toarray") else transformed

        explainer = shap.TreeExplainer(estimator)
        shap_values = explainer.shap_values(transformed)

        if isinstance(shap_values, list):
            raw_values = shap_values[1][0]
        else:
            raw_values = shap_values[0]

        feature_names = preprocessor.get_feature_names_out(model_input.columns)
        grouped = defaultdict(float)
        for fname, sval in zip(feature_names, raw_values):
            if "__" in fname:
                base_name = fname.split("__", 1)[1].split("_", 1)[0]
            else:
                base_name = fname
            grouped[base_name] += float(abs(sval))

        map_to_raw = {
            "HR": "heart_rate",
            "Temp": "temperature_c",
            "O2Sat": "oxygen_saturation",
            "Resp": "respiratory_rate",
            "MAP": "map",
            "Glucose": "glucose",
        }

        raw_map = {
            "heart_rate": payload.heart_rate,
            "temperature_c": payload.temperature_c,
            "oxygen_saturation": payload.oxygen_saturation,
            "respiratory_rate": payload.respiratory_rate,
            "map": payload.map,
            "glucose": payload.glucose,
            "wbc": payload.wbc if payload.wbc is not None else 8.0,
        }

        scored: list[tuple[float, str]] = []
        for k, v in grouped.items():
            raw_key = map_to_raw.get(k)
            if raw_key not in NORMAL_RANGES:
                continue
            scored.append((v, _factor_sentence(raw_key, raw_map[raw_key], high_risk)))

        if payload.wbc is not None:
            wbc_text = _factor_sentence("wbc", payload.wbc, high_risk)
            wbc_bonus = max((s[0] for s in scored), default=0.1) * 0.8
            scored.append((wbc_bonus, wbc_text))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [text for _, text in scored[:3]]
    except Exception:
        return []


def top_factors_for_prediction(
    model,
    payload: PredictionRequest,
    probability: float,
    raw_features: dict[str, float],
) -> list[str]:
    high_risk = probability >= 0.5
    model_input = request_to_model_frame(payload)

    shap_factors = _shap_local_importance(model, model_input, payload, high_risk)
    if len(shap_factors) >= 3:
        return shap_factors[:3]

    return _fallback_local_importance(raw_features, high_risk)

