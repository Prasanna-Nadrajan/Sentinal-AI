import random
import time
import asyncio
from typing import AsyncGenerator

from .schemas import PredictionRequest

def get_baseline_patient() -> PredictionRequest:
    """Returns a stable, healthy baseline patient."""
    return PredictionRequest(
        gender=1,
        age=65,
        heart_rate=75,
        temperature_c=37.0,
        oxygen_saturation=98,
        sbp=120,
        map=90,
        dbp=75,
        respiratory_rate=14,
        fio2=21,
        glucose=100,
        wbc=7.5,
        iculos=12,
        hosp_adm_time=-5,
        unit1=1,
        unit2=0
    )

def deteriorate_patient(patient: PredictionRequest, step: int) -> PredictionRequest:
    """
    Simulates clinical deterioration over time.
    As step increases, vitals slowly drift towards sepsis ranges.
    """
    # Base randomness
    hr_drift = random.uniform(0.5, 3.0)
    temp_drift = random.uniform(0.05, 0.2)
    o2_drift = random.uniform(-1.0, 0.0)
    sbp_drift = random.uniform(-3.0, 0.0)
    resp_drift = random.uniform(0.2, 1.0)
    wbc_drift = random.uniform(0.1, 0.8)

    # Apply drifts
    patient.heart_rate = min(150, patient.heart_rate + hr_drift)
    patient.temperature_c = min(40.0, patient.temperature_c + temp_drift)
    patient.oxygen_saturation = max(85, patient.oxygen_saturation + o2_drift)
    
    # Blood pressures
    patient.sbp = max(70, patient.sbp + sbp_drift)
    patient.dbp = max(40, patient.dbp + (sbp_drift * 0.6))
    patient.map = (patient.sbp + 2 * patient.dbp) / 3
    
    patient.respiratory_rate = min(35, patient.respiratory_rate + resp_drift)
    patient.wbc = min(25, patient.wbc + wbc_drift) if patient.wbc else 8.0
    
    # Time always goes up
    patient.iculos += 1  # 1 hour per step
    
    return patient

async def generate_patient_stream() -> AsyncGenerator[PredictionRequest, None]:
    """
    Async generator that yields a worsening patient state every few seconds.
    """
    patient = get_baseline_patient()
    step = 0
    
    while True:
        yield patient
        # Wait a real-world second before next tick
        await asyncio.sleep(2)
        step += 1
        patient = deteriorate_patient(patient, step)
