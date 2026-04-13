import { CircleAlert, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from './ui/alert'

type InsightCardProps = {
  probability: number
  factors: string[]
}

export function InsightCard({ probability, factors }: InsightCardProps) {
  const isRisk = probability >= 0.5
  const title = isRisk ? 'Clinical Warning Signs' : 'Patient Stability Markers'
  const emptyState = isRisk
    ? 'Awaiting model insight factors.'
    : 'Vitals are currently trending within expected ranges.'

  return (
    <section className="panel">
      <h2 className="panel-title">Insight Card</h2>
      <Alert variant={isRisk ? 'warning' : 'success'}>
        <div className="alert-icon-wrap">{isRisk ? <CircleAlert size={18} /> : <ShieldCheck size={18} />}</div>
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {factors.length > 0 ? (
              <ul className="factor-list">
                {factors.slice(0, 3).map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            ) : (
              <p>{emptyState}</p>
            )}
          </AlertDescription>
        </div>
      </Alert>
    </section>
  )
}
