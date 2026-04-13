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

export type PredictionResponse = {
  risk_probability: number
  label: 'sepsis' | 'stable'
  top_factors: string[]
}
