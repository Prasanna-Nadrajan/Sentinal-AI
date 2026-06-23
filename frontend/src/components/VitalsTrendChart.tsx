import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type VitalsTrendChartProps = {
  heartRate: number
  mapValue: number
}

type DataPoint = {
  hour: string
  heartRate: number
  map: number
}

/**
 * Generate 12 hours of mock historical data converging to the current values.
 * Each hour adds slight random jitter but trends toward the current reading.
 */
function generateMockTrend(currentHR: number, currentMAP: number): DataPoint[] {
  const points: DataPoint[] = []
  const hours = 12

  // Start from a "baseline" then converge to current
  const baseHR = currentHR > 90 ? 78 : 85
  const baseMAP = currentMAP < 75 ? 82 : 78

  for (let i = 0; i <= hours; i++) {
    const t = i / hours // 0..1 progress

    // Ease toward current value using cubic interpolation
    const ease = t * t * (3 - 2 * t)

    // Add pseudo-random jitter (deterministic from index for stability)
    const jitterHR = Math.sin(i * 2.7 + 1.3) * 5 * (1 - t)
    const jitterMAP = Math.cos(i * 1.9 + 0.7) * 4 * (1 - t)

    const hr = Math.round(baseHR + (currentHR - baseHR) * ease + jitterHR)
    const map = Math.round(baseMAP + (currentMAP - baseMAP) * ease + jitterMAP)

    const hourLabel = i === hours ? 'Now' : `T-${hours - i}h`

    points.push({
      hour: hourLabel,
      heartRate: Math.max(40, Math.min(180, hr)),
      map: Math.max(30, Math.min(150, map)),
    })
  }

  return points
}

export function VitalsTrendChart({ heartRate, mapValue }: VitalsTrendChartProps) {
  const data = useMemo(() => generateMockTrend(heartRate, mapValue), [heartRate, mapValue])

  return (
    <section className="panel trend-panel">
      <h2 className="panel-title">12-Hour Vitals Trend</h2>
      <p className="trend-subtitle">Heart Rate &amp; Mean Arterial Pressure — simulated longitudinal data</p>
      <div className="trend-chart-container">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
            <XAxis
              dataKey="hour"
              stroke="#5a7a94"
              tick={{ fill: '#7a9ab5', fontSize: 11 }}
              tickLine={{ stroke: '#2f3f53' }}
            />
            <YAxis
              yAxisId="hr"
              orientation="left"
              stroke="#5a7a94"
              tick={{ fill: '#7a9ab5', fontSize: 11 }}
              domain={['dataMin - 10', 'dataMax + 10']}
              label={{
                value: 'HR (bpm)',
                angle: -90,
                position: 'insideLeft',
                fill: '#ef4444',
                fontSize: 11,
                dx: -5,
              }}
            />
            <YAxis
              yAxisId="map"
              orientation="right"
              stroke="#5a7a94"
              tick={{ fill: '#7a9ab5', fontSize: 11 }}
              domain={['dataMin - 10', 'dataMax + 10']}
              label={{
                value: 'MAP (mmHg)',
                angle: 90,
                position: 'insideRight',
                fill: '#3b82f6',
                fontSize: 11,
                dx: 5,
              }}
            />
            <Tooltip
              contentStyle={{
                background: '#0f1923',
                border: '1px solid #263241',
                borderRadius: '8px',
                color: '#d6dde4',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#97a7ba' }}
            />
            <Legend
              wrapperStyle={{ color: '#97a7ba', fontSize: '12px', paddingTop: '8px' }}
            />
            <Line
              yAxisId="hr"
              type="monotone"
              dataKey="heartRate"
              name="Heart Rate"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#ef4444', stroke: '#0e1116', strokeWidth: 2 }}
            />
            <Line
              yAxisId="map"
              type="monotone"
              dataKey="map"
              name="MAP"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6', stroke: '#0e1116', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
