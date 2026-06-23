"""Pydantic models for the Sentinel AI Sepsis CDSS API.

Includes structured XAI output schemas, FHIR interoperability wrappers,
PDF report request models, and backward-compatible prediction I/O.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class RiskDirection(str, Enum):
    """Direction of a vital-sign deviation relative to the normal range."""
    elevated = "elevated"
    reduced = "reduced"
    normal = "normal"


class RiskCategory(str, Enum):
    """Tri-level clinical risk stratification."""
    stable = "Stable"
    surveillance = "Surveillance"
    critical = "Critical"


# ---------------------------------------------------------------------------
# Core Prediction Request / Response
# ---------------------------------------------------------------------------

class PredictionRequest(BaseModel):
    """Flat vital-sign input accepted by the prediction engine."""
    gender: int = Field(..., ge=0, le=1, description="0=female, 1=male")
    heart_rate: float = Field(..., ge=0, le=260)
    temperature_c: float = Field(..., ge=25, le=45)
    age: float = Field(..., ge=0, le=120)
    oxygen_saturation: float = Field(..., ge=0, le=100)
    sbp: float = Field(..., ge=40, le=300)
    map: float = Field(..., ge=20, le=250)
    dbp: float = Field(..., ge=20, le=200)
    respiratory_rate: float = Field(..., ge=0, le=80)
    fio2: float = Field(default=21, ge=0, le=100)
    glucose: float = Field(default=100, ge=0, le=1000)
    unit1: int = Field(default=1, ge=0, le=1)
    unit2: int = Field(default=0, ge=0, le=1)
    wbc: float | None = Field(default=None, ge=0, le=100)
    iculos: float = Field(..., ge=0, le=1000)
    hosp_adm_time: float = Field(..., ge=-5000, le=5000)


# ---------------------------------------------------------------------------
# Structured XAI Models
# ---------------------------------------------------------------------------

class FeatureAttribution(BaseModel):
    """Per-feature contribution to the sepsis risk prediction."""
    feature_name: str = Field(..., description="Internal feature key (e.g. 'heart_rate')")
    display_name: str = Field(..., description="Human-readable name (e.g. 'Heart Rate')")
    raw_value: float = Field(..., description="The patient's actual measured value")
    unit: str = Field(..., description="Unit of measurement (e.g. 'bpm')")
    normal_range_low: float = Field(..., description="Low end of the normal range")
    normal_range_high: float = Field(..., description="High end of the normal range")
    importance_score: float = Field(
        ..., ge=0, description="SHAP / z-score–based importance (0 = no contribution)"
    )
    direction: RiskDirection = Field(
        ..., description="Whether the value is elevated, reduced, or normal"
    )


class ClinicalInsight(BaseModel):
    """An actionable recommendation tied to a specific risk factor."""
    trigger_feature: str = Field(..., description="Feature that triggered this insight")
    recommendation: str = Field(..., description="Plain-language clinical recommendation")
    protocol_reference: str = Field(
        ..., description="Guideline reference (e.g. 'Surviving Sepsis Campaign Hour-1 Bundle')"
    )


class Explanation(BaseModel):
    """Structured, granular explanation of a sepsis risk prediction."""
    feature_attributions: list[FeatureAttribution] = Field(
        ..., description="Ranked list of features driving the prediction"
    )
    clinical_narrative: str = Field(
        ..., description="Human-readable paragraph summarizing the patient risk state"
    )
    clinical_insights: list[ClinicalInsight] = Field(
        ..., description="Actionable recommendations mapped to SSC protocols"
    )
    risk_category: RiskCategory = Field(
        ..., description="Tri-level risk stratification"
    )


class PredictionResponse(BaseModel):
    """Full prediction response including structured explanation."""
    risk_probability: float
    label: str
    risk_category: RiskCategory
    explanation: Explanation
    # Backward compatibility — simple string list
    top_factors: list[str]


# ---------------------------------------------------------------------------
# FHIR Interoperability Models
# ---------------------------------------------------------------------------

class FHIRCoding(BaseModel):
    """Minimal HL7 FHIR Coding element."""
    system: str = Field(
        default="http://loinc.org",
        description="Code system URI",
    )
    code: str = Field(..., description="LOINC or local code")
    display: str | None = Field(default=None, description="Human-readable name")


class FHIRCodeableConcept(BaseModel):
    """Minimal HL7 FHIR CodeableConcept."""
    coding: list[FHIRCoding] = Field(..., min_length=1)


class FHIRQuantity(BaseModel):
    """Minimal HL7 FHIR Quantity."""
    value: float
    unit: str | None = None
    system: str | None = None
    code: str | None = None


class FHIRObservation(BaseModel):
    """Simplified HL7 FHIR Observation resource for vital-sign intake."""
    resourceType: Literal["Observation"] = "Observation"
    code: FHIRCodeableConcept
    valueQuantity: FHIRQuantity


class FHIRPredictionRequest(BaseModel):
    """Accept a bundle of FHIR Observation resources for prediction."""
    patient_id: str | None = Field(default=None, description="Optional patient identifier")
    gender: int = Field(..., ge=0, le=1, description="0=female, 1=male")
    age: float = Field(..., ge=0, le=120)
    observations: list[FHIRObservation] = Field(
        ..., min_length=1, description="List of FHIR Observation resources"
    )
    # Fields that don't map easily from FHIR observations
    unit1: int = Field(default=1, ge=0, le=1)
    unit2: int = Field(default=0, ge=0, le=1)
    iculos: float = Field(default=24, ge=0, le=1000)
    hosp_adm_time: float = Field(default=0, ge=-5000, le=5000)


# ---------------------------------------------------------------------------
# PDF Report Models
# ---------------------------------------------------------------------------

class ReportRequest(BaseModel):
    """Payload for clinical PDF report generation."""
    vitals: PredictionRequest
    patient_id: str | None = Field(default="PID-000000", description="Mock patient ID")
    patient_name: str | None = Field(default="John Doe", description="Mock patient name")
