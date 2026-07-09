import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const clinical = [
  { metric: 'AUROC', value: '≥ 0.88', desc: 'Discrimination ability', progress: 88, color: 'accent-cyan', gradient: 'from-[#22d3ee] to-[#3b82f6]' },
  { metric: 'AUPRC', value: '≥ 0.72', desc: 'Imbalanced dataset performance', progress: 72, color: 'accent-purple', gradient: 'from-[#a855f7] to-[#3b82f6]' },
  { metric: 'Sensitivity@48h', value: '≥ 85%', desc: 'True sepsis caught in advance', progress: 85, color: 'accent-emerald', gradient: 'from-[#10b981] to-[#22d3ee]' },
  { metric: 'Specificity', value: '≥ 75%', desc: 'Minimizing alert fatigue', progress: 75, color: 'accent-sky', gradient: 'from-[#38bdf8] to-[#3b82f6]' },
]

const technical = [
  { metric: 'E2E Latency (P95)', value: '< 500ms', icon: '⚡' },
  { metric: 'API Uptime SLA', value: '≥ 99.9%', icon: '🟢' },
  { metric: 'Pipeline Lag', value: '< 30s', icon: '📡' },
  { metric: 'Dashboard Load', value: '< 2s', icon: '🖥️' },
]

const trust = [
  { metric: 'Alert Override Rate', target: '< 25%', baseline: 'Industry: ~60%' },
  { metric: 'Explanation Utility', target: '≥ 4.2/5.0', baseline: 'Clinician rating' },
  { metric: 'Time-to-Treatment', target: '≥ 30% ↓', baseline: 'vs. historical' },
]

export default function MetricsSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full bg-[#22d3ee]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-6xl px-8 lg:px-12">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-4">
          <span className="tag-pill bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
            EVALUATION METRICS
          </span>
        </motion.div>

        <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-3xl md:text-4xl font-bold mb-6">
          Quantified <span className="bg-gradient-to-r from-[#f59e0b] to-[#10b981] bg-clip-text text-transparent">Clinical Performance</span>
        </motion.h2>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {clinical.map((m, i) => (
              <motion.div key={m.metric} variants={fadeUp} initial="hidden" animate="visible" custom={2 + i}
                className="glass rounded-xl p-4 flex items-center gap-5">
                <div className="min-w-[110px]">
                  <div className="text-xs text-[#94a3b8] mb-0.5">{m.metric}</div>
                  <div className="text-2xl font-black" style={{ color: `var(--color-${m.color})` }}>{m.value}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-[#94a3b8] mb-2">{m.desc}</div>
                  <div className="progress-bar-bg h-2">
                    <motion.div className={`progress-bar-fill h-full bg-gradient-to-r ${m.gradient}`}
                      initial={{ width: 0 }} animate={{ width: `${m.progress}%` }}
                      transition={{ delay: 0.5 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Technical</h3>
              <div className="space-y-2">
                {technical.map((m, i) => (
                  <motion.div key={m.metric} variants={fadeUp} initial="hidden" animate="visible" custom={7 + i}
                    className="glass rounded-lg p-3 flex items-center gap-3">
                    <span>{m.icon}</span>
                    <div>
                      <div className="text-[10px] text-[#64748b]">{m.metric}</div>
                      <div className="text-sm font-bold text-[#f1f5f9]">{m.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Clinical Trust</h3>
              <div className="space-y-2">
                {trust.map((m, i) => (
                  <motion.div key={m.metric} variants={fadeUp} initial="hidden" animate="visible" custom={11 + i}
                    className="glass rounded-lg p-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-[#64748b]">{m.metric}</span>
                      <span className="text-sm font-bold text-[#22d3ee]">{m.target}</span>
                    </div>
                    <div className="text-[9px] text-[#64748b]/60">{m.baseline}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
