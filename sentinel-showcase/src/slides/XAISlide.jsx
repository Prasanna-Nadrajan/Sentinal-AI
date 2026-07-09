import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const evolution = [
  {
    phase: 'Before',
    title: 'Basic Z-Score Analysis',
    description: 'Simple deviation from normal ranges. No context on feature interactions or clinical significance.',
    color: 'accent-rose',
    bgColor: 'bg-accent-rose/5',
    borderColor: 'border-accent-rose/20',
    items: ['Raw deviation values', 'No feature ranking', 'No clinical context', 'No protocol mapping'],
  },
  {
    phase: 'After',
    title: 'Granular SHAP/LIME Attribution',
    description: 'Game-theoretic feature importance mapped to Surviving Sepsis Campaign protocols.',
    color: 'accent-cyan',
    bgColor: 'bg-accent-cyan/5',
    borderColor: 'border-accent-cyan/20',
    items: ['Per-patient SHAP values', 'Ranked feature contributions', 'What-if scenario analysis', 'SSC protocol mapping'],
  },
]

const xaiFeatures = [
  {
    icon: '📊',
    title: 'SHAP Waterfall Charts',
    desc: 'Per-patient, per-prediction feature contribution breakdowns — sortable by magnitude.',
    detail: 'Uses TreeExplainer fast-path for ensemble components',
    color: 'accent-cyan',
  },
  {
    icon: '🔬',
    title: 'LIME What-If Panel',
    desc: 'Interactive scenario simulator — adjust vitals and watch risk score update live.',
    detail: 'Locally faithful linear approximations of decision boundary',
    color: 'accent-purple',
  },
  {
    icon: '📝',
    title: 'Clinical Narratives',
    desc: 'Auto-generated plain-language summaries linking risk factors to treatment pathways.',
    detail: 'e.g. "Elevated lactate trend (+0.8 mmol/L over 4h)..."',
    color: 'accent-emerald',
  },
  {
    icon: '🏥',
    title: 'SSC Protocol Mapping',
    desc: 'Every abnormal feature mapped to Surviving Sepsis Campaign Hour-1 Bundle actions.',
    detail: 'Blood cultures, antibiotics, IV fluids — evidence-based recommendations',
    color: 'accent-amber',
  },
]

export default function XAISlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-accent-cyan/5 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full bg-accent-purple/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-6xl px-8 lg:px-12">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-4">
          <span className="tag-pill bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            EXPLAINABLE AI ENGINE
          </span>
        </motion.div>

        <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          From Black Box to{' '}
          <span className="bg-gradient-to-r from-accent-cyan to-accent-emerald bg-clip-text text-transparent">
            Glass Box
          </span>
        </motion.h2>

        {/* Evolution comparison */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {evolution.map((phase, i) => (
            <motion.div
              key={phase.phase}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2 + i}
              className={`glass rounded-xl p-5 border ${phase.borderColor}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-mono font-bold text-${phase.color} px-2 py-0.5 rounded ${phase.bgColor}`}>
                  {phase.phase}
                </span>
                <h3 className="text-sm font-semibold text-text-primary">{phase.title}</h3>
              </div>
              <p className="text-xs text-text-secondary mb-3 leading-relaxed">{phase.description}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {phase.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-1 h-1 rounded-full bg-${phase.color}`} />
                    <span className="text-text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Arrow between them */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex justify-center -mt-3 mb-3"
        >
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 -mt-10 text-2xl text-accent-cyan/40">
            ⟶
          </div>
        </motion.div>

        {/* XAI Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {xaiFeatures.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5 + i}
              className="metric-card group"
            >
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-${feat.color}/50 to-transparent`} />
              <span className="text-xl mb-2 block">{feat.icon}</span>
              <h4 className={`text-xs font-semibold text-${feat.color} mb-1`}>{feat.title}</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mb-2">{feat.desc}</p>
              <p className="text-[9px] text-text-muted font-mono leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {feat.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
