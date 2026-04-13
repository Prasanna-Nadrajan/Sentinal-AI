import { Activity, Droplets, HeartPulse, Thermometer, Wind } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import type { PredictionRequest } from '../types'

type VitalsInputFormProps = {
  onSubmit: (payload: PredictionRequest) => Promise<void>
  loading: boolean
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

export function VitalsInputForm({ onSubmit, loading }: VitalsInputFormProps) {
  const [form, setForm] = useState<PredictionRequest>(initialForm)

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
          <input type="number" value={form.heart_rate} onChange={(e) => updateField('heart_rate', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Thermometer size={16} /> Temperature C</span>
          <input type="number" step="0.1" value={form.temperature_c} onChange={(e) => updateField('temperature_c', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Droplets size={16} /> MAP</span>
          <input type="number" value={form.map} onChange={(e) => updateField('map', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Wind size={16} /> Resp Rate</span>
          <input type="number" value={form.respiratory_rate} onChange={(e) => updateField('respiratory_rate', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label"><Activity size={16} /> WBC</span>
          <input type="number" step="0.1" value={form.wbc} onChange={(e) => updateField('wbc', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Age</span>
          <input type="number" value={form.age} onChange={(e) => updateField('age', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Oxygen Saturation</span>
          <input type="number" value={form.oxygen_saturation} onChange={(e) => updateField('oxygen_saturation', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">SBP</span>
          <input type="number" value={form.sbp} onChange={(e) => updateField('sbp', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">DBP</span>
          <input type="number" value={form.dbp} onChange={(e) => updateField('dbp', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">FiO2</span>
          <input type="number" value={form.fio2} onChange={(e) => updateField('fio2', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Glucose</span>
          <input type="number" value={form.glucose} onChange={(e) => updateField('glucose', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">ICULOS</span>
          <input type="number" value={form.iculos} onChange={(e) => updateField('iculos', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Hosp Adm Time</span>
          <input type="number" value={form.hosp_adm_time} onChange={(e) => updateField('hosp_adm_time', Number(e.target.value))} />
        </label>
        <label>
          <span className="field-label">Gender (0/1)</span>
          <input type="number" min={0} max={1} value={form.gender} onChange={(e) => updateField('gender', Number(e.target.value) as 0 | 1)} />
        </label>
        <label>
          <span className="field-label">Unit1 (0/1)</span>
          <input type="number" min={0} max={1} value={form.unit1} onChange={(e) => updateField('unit1', Number(e.target.value) as 0 | 1)} />
        </label>
        <label>
          <span className="field-label">Unit2 (0/1)</span>
          <input type="number" min={0} max={1} value={form.unit2} onChange={(e) => updateField('unit2', Number(e.target.value) as 0 | 1)} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Run Sepsis Prediction'}
        </button>
      </form>
    </section>
  )
}
