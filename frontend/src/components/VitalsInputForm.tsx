import { Activity, Droplets, HeartPulse, Thermometer, Wind, Play, Square } from 'lucide-react'
import { useState, useEffect, type FormEvent } from 'react'

import type { PredictionRequest } from '../types'

type VitalsInputFormProps = {
  onSubmit: (payload: PredictionRequest) => Promise<void>
  loading: boolean
  isLive?: boolean
  onToggleLive?: () => void
  currentVitals?: PredictionRequest | null
}

const initialForm: PredictionRequest = {
  gender: 1,
  heart_rate: 110,
  temperature_c: 39,
  age: 67,
  oxygen_saturation: 89,
  sbp: 92,
  map: 62,
  dbp: 55,
  respiratory_rate: 26,
  fio2: 32,
  glucose: 168,
  unit1: 1,
  unit2: 0,
  wbc: 14.6,
  iculos: 18,
  hosp_adm_time: -8,
}

export function VitalsInputForm({ 
  onSubmit, 
  loading, 
  isLive = false, 
  onToggleLive, 
  currentVitals 
}: VitalsInputFormProps) {
  const [form, setForm] = useState<PredictionRequest>(initialForm)

  useEffect(() => {
    if (isLive && currentVitals) {
      setForm(currentVitals)
    }
  }, [isLive, currentVitals])

  function updateField<K extends keyof PredictionRequest>(key: K, value: number) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Patient Vitals</h2>
      <form className="vitals-grid" onSubmit={handleSubmit}>
        <label>
          <span className="field-label"><HeartPulse size={16} /> Heart Rate</span>
          <input disabled={isLive} type="number" value={form.heart_rate} onChange={(e) => updateField('heart_rate', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Thermometer size={16} /> Temperature C</span>
          <input disabled={isLive} type="number" step="0.1" value={form.temperature_c} onChange={(e) => updateField('temperature_c', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Droplets size={16} /> MAP</span>
          <input disabled={isLive} type="number" value={form.map} onChange={(e) => updateField('map', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Wind size={16} /> Resp Rate</span>
          <input disabled={isLive} type="number" value={form.respiratory_rate} onChange={(e) => updateField('respiratory_rate', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Activity size={16} /> WBC</span>
          <input disabled={isLive} type="number" step="0.1" value={form.wbc} onChange={(e) => updateField('wbc', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Age</span>
          <input disabled={isLive} type="number" value={form.age} onChange={(e) => updateField('age', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Oxygen Saturation</span>
          <input disabled={isLive} type="number" value={form.oxygen_saturation} onChange={(e) => updateField('oxygen_saturation', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">SBP</span>
          <input disabled={isLive} type="number" value={form.sbp} onChange={(e) => updateField('sbp', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">DBP</span>
          <input disabled={isLive} type="number" value={form.dbp} onChange={(e) => updateField('dbp', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">FiO2</span>
          <input disabled={isLive} type="number" value={form.fio2} onChange={(e) => updateField('fio2', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Glucose</span>
          <input disabled={isLive} type="number" value={form.glucose} onChange={(e) => updateField('glucose', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">ICULOS</span>
          <input disabled={isLive} type="number" value={form.iculos} onChange={(e) => updateField('iculos', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Hosp Adm Time</span>
          <input disabled={isLive} type="number" value={form.hosp_adm_time} onChange={(e) => updateField('hosp_adm_time', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Gender (0/1)</span>
          <input disabled={isLive} type="number" min={0} max={1} value={form.gender} onChange={(e) => updateField('gender', Number(e.target.value) as 0 | 1)} />
        </label>
        <label>
          <span className="field-label">Unit1 (0/1)</span>
          <input type="number" min={0} max={1} value={form.unit1} onChange={(e) => updateField('unit1', Number(e.target.value) as 0 | 1)} disabled={isLive} />
        </label>
        <label>
          <span className="field-label">Unit2 (0/1)</span>
          <input type="number" min={0} max={1} value={form.unit2} onChange={(e) => updateField('unit2', Number(e.target.value) as 0 | 1)} disabled={isLive} />
        </label>

        <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1' }}>
          <button type="submit" disabled={loading || isLive} style={{ flex: 1 }}>
            {loading ? 'Calculating...' : 'Run Sepsis Prediction'}
          </button>
          
          {onToggleLive && (
            <button 
              type="button" 
              onClick={onToggleLive} 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: isLive ? '#dc2626' : '#2563eb' }}
            >
              {isLive ? <><Square size={16} /> Stop Live Feed</> : <><Play size={16} /> Start Live EHR Feed</>}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
