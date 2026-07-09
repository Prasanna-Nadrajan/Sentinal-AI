import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const dataSources = [
  {
    icon: '🏥',
    title: 'Electronic Health Records',
    subtitle: 'EHR',
    signals: 'Labs (lactate, WBC, CRP), vitals, medications, comorbidities',
    frequency: 'On-admission + event-triggered',
    color: 'accent-blue',
  },
  {
    icon: '⌚',
    title: 'Wearable Sensor Streams',
    subtitle: 'IoT',
    signals: 'Continuous HR, SpO₂, respiratory rate, skin temp, HRV',
    frequency: 'Real-time (sub-minute)',
    color: 'accent-emerald',
  },
  {
    icon: '🏘️',
    title: 'Social Determinants of Health',
    subtitle: 'SDOH',
    signals: 'Housing stability, food security, deprivation index',
    frequency: 'On-admission',
    color: 'accent-purple',
  },
]

const pipeline = [
  { step: '01', label: 'Ingest', desc: 'Multi-modal data fusion', icon: '⟶' },
  { step: '02', label: 'Process', desc: 'Feature engineering & normalization', icon: '⟶' },
  { step: '03', label: 'Predict', desc: 'TFT + XGBoost ensemble', icon: '⟶' },
  { step: '04', label: 'Explain', desc: 'SHAP / LIME attribution', icon: '⟶' },
  { step: '05', label: 'Alert', desc: '48-hour early warning', icon: '✓' },
]

export default function SolutionSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-accent-blue/6 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-accent-emerald/6 blur-[100px]" />

      <div className="relative z-10 w-full max-w-6xl px-8 lg:px-12">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6">
          <span className="tag-pill bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            THE SOLUTION
          </span>
        </motion.div>

        <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
          Multi-Modal Intelligence for{' '}
          <span className="bg-gradient-to-r from-accent-emerald to-accent-cyan bg-clip-text text-transparent">
            48-Hour Forecasting
          </span>
        </motion.h2>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-text-secondary text-sm mb-8 max-w-3xl">
          Fusing three distinct data modalities through a cross-attention transformer backbone 
          to deliver early-warning signals with sub-500ms inference latency.
        </motion.p>

        {/* Data source cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {dataSources.map((src, i) => (
            <motion.div
              key={src.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3 + i}
              className="metric-card group"
            >
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-${src.color}/60 to-transparent`} />
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{src.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{src.title}</h3>
                  <span className={`text-[10px] font-mono font-medium text-${src.color}`}>{src.subtitle}</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-2">{src.signals}</p>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-${src.color} animate-pulse`} />
                <span className="text-[10px] text-text-muted">{src.frequency}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline flow */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}
          className="glass-strong rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
            Inference Pipeline
          </h3>
          <div className="flex items-center justify-between gap-2">
            {pipeline.map((step, i) => (
              <div key={step.step} className="flex items-center gap-2 flex-1">
                <div className="flex-1 text-center">
                  <div className="text-[10px] font-mono text-accent-cyan/60 mb-1">{step.step}</div>
                  <div className="text-sm font-semibold text-text-primary">{step.label}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{step.desc}</div>
                </div>
                {i < pipeline.length - 1 && (
                  <div className="text-accent-cyan/30 text-lg shrink-0">→</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
