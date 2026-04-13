type RiskGaugeProps = {
  probability: number
}

function severityClass(probability: number): string {
  if (probability >= 0.7) return 'risk-danger'
  if (probability >= 0.5) return 'risk-warning'
  return 'risk-safe'
}

export function RiskGauge({ probability }: RiskGaugeProps) {
  const percent = Math.round(probability * 100)

  return (
    <section className="panel">
      <h2 className="panel-title">Sepsis Probability</h2>
      <div className="gauge-shell">
        <div
          className={`gauge-fill ${severityClass(probability)}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <p className="gauge-value">{percent}%</p>
    </section>
  )
}
