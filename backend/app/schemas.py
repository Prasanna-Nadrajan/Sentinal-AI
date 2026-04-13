from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
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


class PredictionResponse(BaseModel):
    risk_probability: float
    label: str
    top_factors: list[str]
