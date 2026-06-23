/* ============================================================
   Types mirroring the Sentinel AI CDSS backend API models.
   ============================================================ */

export type PredictionRequest = {
  gender: 0 | 1
  heart_rate: number
  temperature_c: number
  age: number
  oxygen_saturation: number
  sbp: number
  map: number
  dbp: number
  respiratory_rate: number
  fio2: number
  glucose: number
  unit1: 0 | 1
  unit2: 0 | 1
  wbc?: number
  iculos: number
  hosp_adm_time: number
}

/* ---- Structured XAI Models ---- */

export type RiskDirection = 'elevated' | 'reduced' | 'normal'
export type RiskCategory = 'Stable' | 'Surveillance' | 'Critical'

export type FeatureAttribution = {
  feature_name: string
  display_name: string
  raw_value: number
  unit: string
  normal_range_low: number
  normal_range_high: number
  importance_score: number
  direction: RiskDirection
}

export type ClinicalInsight = {
  trigger_feature: string
  recommendation: string
  protocol_reference: string
}

export type Explanation = {
  feature_attributions: FeatureAttribution[]
  clinical_narrative: string
  clinical_insights: ClinicalInsight[]
  risk_category: RiskCategory
}

export type PredictionResponse = {
  risk_probability: number
  label: 'sepsis' | 'stable'
  risk_category: RiskCategory
  explanation: Explanation
  top_factors: string[]
}

/* ---- Report Request ---- */

export type ReportRequest = {
  vitals: PredictionRequest
  patient_id?: string
  patient_name?: string
}
