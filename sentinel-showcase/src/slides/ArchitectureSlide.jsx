import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stackLayers = [
  {
    layer: 'Frontend',
    items: [
      { name: 'React 18 + TypeScript', role: 'Clinical Dashboard UI', color: 'accent-sky' },
      { name: 'Recharts + D3.js', role: 'SHAP waterfalls, risk timelines', color: 'accent-sky' },
      { name: 'Zustand', role: 'Global state management', color: 'accent-sky' },
    ],
    accent: 'accent-sky',
  },
  {
    layer: 'Backend API',
    items: [
      { name: 'FastAPI (Python)', role: 'Async FHIR-compliant REST & SSE', color: 'accent-emerald' },
      { name: 'ReportLab PDF Engine', role: 'Clinical PDF report generation', color: 'accent-emerald' },
      { name: 'HIPAA Audit Logger', role: 'Full AuditEvent trails', color: 'accent-emerald' },
    ],
    accent: 'accent-emerald',
  },
  {
    layer: 'ML Core',
    items: [
      { name: 'Temporal Fusion Transformer', role: 'Time-series prediction (PyTorch)', color: 'accent-purple' },
      { name: 'XGBoost / LightGBM', role: 'Tabular EHR & SDOH ensemble', color: 'accent-purple' },
      { name: 'ONNX Runtime', role: 'Quantized model serving <500ms', color: 'accent-purple' },
    ],
    accent: 'accent-purple',
  },
  {
    layer: 'Infrastructure',
    items: [
      { name: 'Docker + Kubernetes', role: 'Container orchestration', color: 'accent-amber' },
      { name: 'Apache Kafka', role: 'Real-time data streaming', color: 'accent-amber' },
      { name: 'PostgreSQL + TimescaleDB', role: 'Structured + time-series storage', color: 'accent-amber' },
    ],
    accent: 'accent-amber',
  },
]

const newFeatures = [
  {
    icon: '📄',
    title: 'PDF Report Generation',
    desc: 'Professional, print-ready clinical reports via ReportLab — styled after Epic/Cerner documents with SHAP tables, risk cards, and SSC protocol mapping.',
    color: 'accent-cyan',
  },
  {
    icon: '🔒',
    title: 'HIPAA Audit Logging',
    desc: 'Full FHIR AuditEvent trails for every prediction — meeting HIPAA, 21st Century Cures Act, and institutional compliance requirements.',
    color: 'accent-emerald',
  },
]

export default function ArchitectureSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-accent-purple/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 w-[350px] h-[350px] rounded-full bg-accent-emerald/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-6xl px-8 lg:px-12">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-4">
          <span className="tag-pill bg-accent-purple/10 text-accent-purple border-accent-purple/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
            ARCHITECTURE & IMPLEMENTATION
          </span>
        </motion.div>

        <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          Full-Stack{' '}
          <span className="bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
            Production Architecture
          </span>
        </motion.h2>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* Tech Stack — 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            {stackLayers.map((layer, li) => (
              <motion.div
                key={layer.layer}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2 + li}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full bg-${layer.accent}`} />
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{layer.layer}</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {layer.items.map((item) => (
                    <div key={item.name} className="arch-node p-3">
                      <div className={`text-xs font-semibold text-${item.color} mb-0.5`}>{item.name}</div>
                      <div className="text-[10px] text-text-muted">{item.role}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* New Features — 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}>
              <h3 className="text-xs font-semibold text-accent-cyan uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-accent-cyan/40" />
                NEW IN v2.0
              </h3>
            </motion.div>

            {newFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={8 + i}
                className={`metric-card border-l-2 border-${feat.color}/40`}
              >
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-${feat.color}/50 to-transparent`} />
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feat.icon}</span>
                  <div>
                    <h4 className={`text-sm font-semibold text-${feat.color} mb-1`}>{feat.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* FHIR badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={10}
              className="glass-strong rounded-xl p-4 mt-auto"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">🔌</span>
                <h4 className="text-sm font-semibold text-accent-blue">FHIR R4 Compliant</h4>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Native integrations for Epic (SMART on FHIR), Cerner (CDS Hooks), and Meditech — 
                surfacing alerts directly within clinical workflows.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
