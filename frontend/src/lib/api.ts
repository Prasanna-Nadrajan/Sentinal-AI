import type { PredictionRequest, PredictionResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function predictSepsis(payload: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.status}`)
  }
  return response.json()
}
