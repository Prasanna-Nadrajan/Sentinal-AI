"""Sentinel AI Sepsis CDSS — FastAPI Application.

Includes HIPAA-compliant audit logging middleware, prediction endpoint,
PDF report generation, and FHIR interoperability wrapper.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from .explain import build_explanation, determine_risk_category, top_factors_for_prediction
from .model_service import ModelService, payload_to_raw_feature_map, request_to_model_frame
from .mock_ehr_stream import generate_patient_stream
from .report import generate_pdf_report
from .schemas import (
    FHIRPredictionRequest,
    PredictionRequest,
    PredictionResponse,
    ReportRequest,
)

# ---------------------------------------------------------------------------
# Logging Setup
# ---------------------------------------------------------------------------

logger = logging.getLogger("sentinel_ai.audit")
logger.setLevel(logging.INFO)

# Console handler
_console_handler = logging.StreamHandler()
_console_handler.setFormatter(
    logging.Formatter("[AUDIT] %(asctime)s — %(message)s", datefmt="%Y-%m-%dT%H:%M:%S%z")
)
logger.addHandler(_console_handler)

# File handler — writes to audit_log.jsonl next to the backend package
_AUDIT_LOG_PATH = Path(__file__).resolve().parents[1] / "audit_log.jsonl"
try:
    _file_handler = logging.FileHandler(str(_AUDIT_LOG_PATH), mode="a", encoding="utf-8")
    _file_handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(_file_handler)
except OSError:
    logger.warning("Could not open audit log file at %s", _AUDIT_LOG_PATH)


# ---------------------------------------------------------------------------
# HIPAA Audit Middleware (Pure ASGI — avoids BaseHTTPMiddleware body issues)
# ---------------------------------------------------------------------------

_AUDITED_PATHS = {"/predict", "/api/report/generate", "/api/fhir/predict"}


class AuditLogMiddleware:
    """ASGI middleware that logs every prediction / report request for HIPAA compliance.

    Logged fields:
    - timestamp (ISO 8601)
    - user_id (from X-User-Id header or default mock)
    - request_body_hash (SHA-256 — never raw PHI)
    - endpoint
    - method
    - response_status
    - request_id (UUID for correlation)
    """

    def __init__(self, app: Any) -> None:
        self.app = app

    async def __call__(self, scope: dict, receive: Any, send: Any) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        method = scope.get("method", "")

        if method != "POST" or path not in _AUDITED_PATHS:
            await self.app(scope, receive, send)
            return

        request_id = str(uuid.uuid4())

        # Extract user_id from headers
        headers_raw = scope.get("headers", [])
        user_id = "clinician-001"
        for hdr_name, hdr_value in headers_raw:
            if hdr_name == b"x-user-id":
                user_id = hdr_value.decode("utf-8", errors="replace")
                break

        # Read body bytes for hashing, then replay them
        body_chunks: list[bytes] = []
        body_received = False

        async def receive_wrapper() -> dict:
            nonlocal body_received
            message = await receive()
            if message.get("type") == "http.request":
                body_chunks.append(message.get("body", b""))
                if not message.get("more_body", False):
                    body_received = True
            return message

        # Capture response status
        response_status = 0

        async def send_wrapper(message: dict) -> None:
            nonlocal response_status
            if message.get("type") == "http.response.start":
                response_status = message.get("status", 0)
            await send(message)

        await self.app(scope, receive_wrapper, send_wrapper)

        # Compute body hash after request completes
        full_body = b"".join(body_chunks)
        body_hash = hashlib.sha256(full_body).hexdigest()

        audit_entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": request_id,
            "user_id": user_id,
            "endpoint": path,
            "method": method,
            "request_body_hash": body_hash,
            "response_status": response_status,
        }

        logger.info(json.dumps(audit_entry))


# ---------------------------------------------------------------------------
# FHIR Observation → PredictionRequest Mapping
# ---------------------------------------------------------------------------

# LOINC codes → our flat field names
_LOINC_MAP: dict[str, str] = {
    "8867-4": "heart_rate",        # Heart rate
    "8310-5": "temperature_c",     # Body temperature
    "2708-6": "oxygen_saturation", # SpO2
    "8480-6": "sbp",               # Systolic BP
    "8478-0": "map",               # Mean arterial pressure
    "8462-4": "dbp",               # Diastolic BP
    "9279-1": "respiratory_rate",  # Respiratory rate
    "3150-0": "fio2",              # FiO2
    "2345-7": "glucose",           # Glucose
    "6690-2": "wbc",               # WBC
}


def _fhir_to_prediction_request(fhir_req: FHIRPredictionRequest) -> PredictionRequest:
    """Convert a FHIR-based request into our flat PredictionRequest."""
    field_values: dict[str, float] = {}

    for obs in fhir_req.observations:
        for coding in obs.code.coding:
            field_name = _LOINC_MAP.get(coding.code)
            if field_name is not None:
                field_values[field_name] = obs.valueQuantity.value
                break

    return PredictionRequest(
        gender=fhir_req.gender,
        age=fhir_req.age,
        heart_rate=field_values.get("heart_rate", 80),
        temperature_c=field_values.get("temperature_c", 37.0),
        oxygen_saturation=field_values.get("oxygen_saturation", 97),
        sbp=field_values.get("sbp", 120),
        map=field_values.get("map", 85),
        dbp=field_values.get("dbp", 75),
        respiratory_rate=field_values.get("respiratory_rate", 16),
        fio2=field_values.get("fio2", 21),
        glucose=field_values.get("glucose", 100),
        wbc=field_values.get("wbc"),
        unit1=fhir_req.unit1,
        unit2=fhir_req.unit2,
        iculos=fhir_req.iculos,
        hosp_adm_time=fhir_req.hosp_adm_time,
    )


# ---------------------------------------------------------------------------
# Application Factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Sentinel AI Sepsis CDSS API",
    version="2.0.0",
    description="Production-grade Clinical Decision Support System for early sepsis detection.",
)

model_service = ModelService()

# Middleware — order matters: CORS first, then audit
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuditLogMiddleware)


# ---------------------------------------------------------------------------
# Shared Prediction Logic
# ---------------------------------------------------------------------------

def _run_prediction(payload: PredictionRequest) -> PredictionResponse:
    """Core prediction pipeline shared by all endpoints."""
    model_input = request_to_model_frame(payload)
    probability = model_service.predict_probability(model_input)
    raw_features = payload_to_raw_feature_map(payload)

    explanation = build_explanation(
        model=model_service.model,
        payload=payload,
        probability=probability,
        raw_features=raw_features,
    )

    top_factors = top_factors_for_prediction(
        model=model_service.model,
        payload=payload,
        probability=probability,
        raw_features=raw_features,
    )

    label = "sepsis" if probability >= 0.5 else "stable"
    risk_category = determine_risk_category(probability)

    return PredictionResponse(
        risk_probability=probability,
        label=label,
        risk_category=risk_category,
        explanation=explanation,
        top_factors=top_factors,
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "version": "2.0.0"}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    """Run sepsis prediction with full structured XAI explanation."""
    return _run_prediction(payload)


@app.post("/api/report/generate")
def generate_report(payload: ReportRequest) -> Response:
    """Generate and download a clinical Sepsis Risk Assessment PDF."""
    prediction = _run_prediction(payload.vitals)
    pdf_bytes = generate_pdf_report(
        probability=prediction.risk_probability,
        explanation=prediction.explanation,
        patient_name=payload.patient_name or "John Doe",
        patient_id=payload.patient_id or "PID-000000",
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=sentinel_ai_sepsis_report.pdf",
        },
    )


@app.post("/api/fhir/predict", response_model=PredictionResponse)
def fhir_predict(payload: FHIRPredictionRequest) -> PredictionResponse:
    """Accept FHIR Observation resources and run sepsis prediction."""
    prediction_request = _fhir_to_prediction_request(payload)
    return _run_prediction(prediction_request)


@app.get("/api/fhir/Patient/{patient_id}/risk-feed")
async def risk_feed(patient_id: str) -> StreamingResponse:
    """Stream real-time sepsis risk updates via Server-Sent Events (SSE)."""
    async def event_generator():
        async for patient_state in generate_patient_stream():
            # Run the XGBoost prediction on the current patient state
            prediction = _run_prediction(patient_state)
            
            # Format as SSE event
            data = json.dumps(prediction.model_dump())
            yield f"data: {data}\n\n"

    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream"
    )

