import type { PredictionRequest, PredictionResponse, ReportRequest } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/**
 * Run a sepsis prediction and receive the full structured explanation.
 */
export async function predictSepsis(payload: PredictionRequest): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Prediction failed (${response.status}): ${text}`)
  }
  return response.json()
}

/**
 * Generate and download a clinical PDF report.
 * Triggers a file download in the browser.
 */
export async function downloadClinicalReport(payload: ReportRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Report generation failed (${response.status}): ${text}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'sentinel_ai_sepsis_report.pdf'
  document.body.appendChild(anchor)
  anchor.click()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, 100)
}
