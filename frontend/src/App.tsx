import { useState } from 'react'

import { InsightCard } from './components/InsightCard'
import { RiskGauge } from './components/RiskGauge'
import { VitalsInputForm } from './components/VitalsInputForm'
import { predictSepsis } from './lib/api'
import type { PredictionResponse } from './types'

function App() {
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePredict(payload: Parameters<typeof predictSepsis>[0]) {
    setLoading(true)
    setError(null)
    try {
      const prediction = await predictSepsis(payload)
      setResult(prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown prediction error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Sentinel AI Sepsis Dashboard</h1>
        <p>Predictive sepsis risk scoring with clinically readable local drivers.</p>
      </header>

      <section className="dashboard-grid">
        <VitalsInputForm onSubmit={handlePredict} loading={loading} />
        <div className="right-column">
          <RiskGauge probability={result?.risk_probability ?? 0} />
          <InsightCard probability={result?.risk_probability ?? 0} factors={result?.top_factors ?? []} />
          {error ? <div className="error-box">{error}</div> : null}
        </div>
      </section>
    </main>
  )
}

export default App
