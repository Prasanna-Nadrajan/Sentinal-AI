import { AlertTriangle, BookOpen, CircleAlert, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react'

import type { Explanation, FeatureAttribution, RiskDirection } from '../types'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

type InsightCardProps = {
  probability: number
  explanation: Explanation | null
}

/* ---- Direction Helpers ---- */

const DIRECTION_ICON: Record<RiskDirection, JSX.Element> = {
  elevated: <TrendingUp size={14} className="dir-icon dir-elevated" />,
  reduced: <TrendingDown size={14} className="dir-icon dir-reduced" />,
  normal: <ShieldCheck size={14} className="dir-icon dir-normal" />,
}

const DIRECTION_LABEL: Record<RiskDirection, string> = {
  elevated: 'HIGH',
  reduced: 'LOW',
  normal: 'NORMAL',
}

/* ---- Sub-Components ---- */

function AttributionBar({ attr, maxScore }: { attr: FeatureAttribution; maxScore: number }) {
  const widthPct = maxScore > 0 ? (attr.importance_score / maxScore) * 100 : 0
  const barClass =
    attr.direction === 'elevated'
      ? 'attr-bar-elevated'
      : attr.direction === 'reduced'
        ? 'attr-bar-reduced'
        : 'attr-bar-normal'

  return (
    <div className="attribution-row">
      <div className="attr-label">
        <span className="attr-name">{attr.display_name}</span>
        <span className="attr-value">
          {attr.raw_value} {attr.unit}
        </span>
      </div>
      <div className="attr-bar-track">
        <div className={`attr-bar-fill ${barClass}`} style={{ width: `${Math.max(widthPct, 4)}%` }} />
      </div>
      <div className="attr-direction">
        {DIRECTION_ICON[attr.direction]}
        <span className={`dir-label dir-${attr.direction}`}>{DIRECTION_LABEL[attr.direction]}</span>
      </div>
      <span className="attr-score">{attr.importance_score.toFixed(3)}</span>
    </div>
  )
}

export function InsightCard({ probability, explanation }: InsightCardProps) {
  const isRisk = probability >= 0.5
  const hasExplanation = explanation !== null

  return (
    <section className="panel insight-panel">
      {/* ---- Clinical Narrative ---- */}
      <h2 className="panel-title">Clinical Assessment</h2>
      {hasExplanation ? (
        <Alert variant={isRisk ? 'warning' : 'success'}>
          <div className="alert-icon-wrap">
            {isRisk ? <CircleAlert size={18} /> : <ShieldCheck size={18} />}
          </div>
          <div>
            <AlertTitle>{isRisk ? 'Clinical Warning' : 'Patient Stability'}</AlertTitle>
            <AlertDescription>
              <p className="narrative-text">{explanation.clinical_narrative}</p>
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <p className="empty-state">Submit patient vitals to receive clinical assessment.</p>
      )}

      {/* ---- Feature Attributions ---- */}
      {hasExplanation && explanation.feature_attributions.length > 0 && (
        <>
          <h3 className="sub-panel-title">Feature Attribution</h3>
          <div className="attribution-list">
            {explanation.feature_attributions.map((attr) => (
              <AttributionBar
                key={attr.feature_name}
                attr={attr}
                maxScore={explanation.feature_attributions[0]?.importance_score ?? 1}
              />
            ))}
          </div>
        </>
      )}

      {/* ---- Actionable Insights ---- */}
      {hasExplanation && explanation.clinical_insights.length > 0 && (
        <>
          <h3 className="sub-panel-title">
            <AlertTriangle size={14} style={{ marginRight: '0.4rem' }} />
            Actionable Recommendations
          </h3>
          <div className="insights-list">
            {explanation.clinical_insights.map((insight, i) => (
              <div key={i} className="insight-card">
                <div className="insight-header">
                  <span className="insight-trigger">{insight.trigger_feature}</span>
                </div>
                <p className="insight-recommendation">{insight.recommendation}</p>
                <div className="insight-protocol">
                  <BookOpen size={12} />
                  <span>{insight.protocol_reference}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
