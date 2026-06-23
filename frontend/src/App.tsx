import { Download, FileText } from 'lucide-react'
import { useState } from 'react'

import { InsightCard } from './components/InsightCard'
import { RiskGauge } from './components/RiskGauge'
import { VitalsTrendChart } from './components/VitalsTrendChart'
import { VitalsInputForm } from './components/VitalsInputForm'
import { downloadClinicalReport, predictSepsis } from './lib/api'
import type { PredictionRequest, PredictionResponse } from './types'

function App() {
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [lastPayload, setLastPayload] = useState<PredictionRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePredict(payload: PredictionRequest) {
    setLoading(true)
    setError(null)
    try {
      const prediction = await predictSepsis(payload)
      setResult(prediction)
      setLastPayload(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown prediction error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadReport() {
    if (!lastPayload) return
    setReportLoading(true)
    try {
      await downloadClinicalReport({
        vitals: lastPayload,
        patient_id: 'PID-' + String(Math.floor(Math.random() * 999999)).padStart(6, '0'),
        patient_name: 'Patient Record',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <span className="header-icon">◈</span> Sentinel AI
              <span className="header-tag">CDSS v2.0</span>
            </h1>
            <p>Clinical Decision Support — Sepsis Risk Prediction &amp; Explainable AI</p>
          </div>
          {result && lastPayload && (
            <button
              className="report-btn"
              onClick={handleDownloadReport}
              disabled={reportLoading}
              id="download-report-btn"
            >
              {reportLoading ? (
                <>
                  <FileText size={16} className="spin" /> Generating…
                </>
              ) : (
                <>
                  <Download size={16} /> Download Clinical Report
                </>
              )}
            </button>
          )}
        </div>
      </header>

      <section className="dashboard-grid">
        {/* Left Column — Vitals Input + Trend Chart */}
        <div className="left-column">
          <VitalsInputForm onSubmit={handlePredict} loading={loading} />
          {result && lastPayload && (
            <VitalsTrendChart
              heartRate={lastPayload.heart_rate}
              mapValue={lastPayload.map}
            />
          )}
        </div>

        {/* Right Column — Gauge + Insights */}
        <div className="right-column">
          <RiskGauge
            probability={result?.risk_probability ?? 0}
            riskCategory={result?.risk_category ?? null}
          />
          <InsightCard
            probability={result?.risk_probability ?? 0}
            explanation={result?.explanation ?? null}
          />
          {error && <div className="error-box" id="error-display">{error}</div>}
        </div>
      </section>

      <footer className="app-footer">
        <p>
          ⚠ For clinical decision support only. Not a substitute for professional clinical judgment.
        </p>
      </footer>
    </main>
  )
}

export default App
