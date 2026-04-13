from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd

from .schemas import PredictionRequest

MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "EarlySepsisPrediction-master"
    / "sepsis_rf_model.joblib"
)

MODEL_FEATURE_ORDER = [
    "HR",
    "O2Sat",
    "Temp",
    "SBP",
    "MAP",
    "DBP",
    "Resp",
    "FiO2",
    "Glucose",
    "Age",
    "Gender",
    "Unit1",
    "Unit2",
    "HospAdmTime",
    "ICULOS",
]


def request_to_model_frame(payload: PredictionRequest) -> pd.DataFrame:
    frame = pd.DataFrame(
        [
            {
                "HR": payload.heart_rate,
                "O2Sat": payload.oxygen_saturation,
                "Temp": payload.temperature_c,
                "SBP": payload.sbp,
                "MAP": payload.map,
                "DBP": payload.dbp,
                "Resp": payload.respiratory_rate,
                "FiO2": payload.fio2,
                "Glucose": payload.glucose,
                "Age": payload.age,
                "Gender": int(payload.gender),
                "Unit1": payload.unit1,
                "Unit2": payload.unit2,
                "ICULOS": payload.iculos,
                "HospAdmTime": payload.hosp_adm_time,
            }
        ]
    )
    return frame[MODEL_FEATURE_ORDER].astype(float)


def payload_to_raw_feature_map(payload: PredictionRequest) -> dict[str, float]:
    return {
        "heart_rate": payload.heart_rate,
        "temperature_c": payload.temperature_c,
        "age": payload.age,
        "oxygen_saturation": payload.oxygen_saturation,
        "sbp": payload.sbp,
        "map": payload.map,
        "dbp": payload.dbp,
        "respiratory_rate": payload.respiratory_rate,
        "fio2": payload.fio2,
        "glucose": payload.glucose,
        "wbc": payload.wbc if payload.wbc is not None else 8.0,
        "iculos": payload.iculos,
        "hosp_adm_time": payload.hosp_adm_time,
    }


class ModelService:
    def __init__(self, model_path: Path = MODEL_PATH):
        self.model = joblib.load(model_path)

    def predict_probability(self, model_input: pd.DataFrame) -> float:
        proba = self.model.predict_proba(model_input)[0][1]
        return float(proba)

