import type { RiskCategory } from '../types'

type RiskGaugeProps = {
  probability: number
  riskCategory: RiskCategory | null
}

function severityClass(probability: number): string {
  if (probability >= 0.7) return 'risk-danger'
  if (probability >= 0.5) return 'risk-warning'
  return 'risk-safe'
}

const CATEGORY_LABEL: Record<RiskCategory, string> = {
  Stable: '● STABLE',
  Surveillance: '◉ SURVEILLANCE',
  Critical: '◈ CRITICAL',
}

export function RiskGauge({ probability, riskCategory }: RiskGaugeProps) {
  const percent = Math.round(probability * 100)
  const isCritical = probability >= 0.7
  const category = riskCategory ?? (probability >= 0.7 ? 'Critical' : probability >= 0.5 ? 'Surveillance' : 'Stable')

  return (
    <section className="panel">
      <h2 className="panel-title">Sepsis Probability</h2>
      <div className="gauge-shell">
        <div
          className={`gauge-fill ${severityClass(probability)} ${isCritical ? 'gauge-pulse' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <div className="gauge-meta">
        <p className={`gauge-value ${severityClass(probability)}-text`}>{percent}%</p>
        <span className={`risk-badge ${severityClass(probability)}-badge`}>
          {CATEGORY_LABEL[category]}
        </span>
      </div>
    </section>
  )
}
