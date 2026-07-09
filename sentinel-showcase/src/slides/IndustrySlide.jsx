import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const saasModel = [
  { tier: 'Hospital', desc: 'Per-bed annual licensing for ICU, ED, step-down', icon: '🏥' },
  { tier: 'Health System', desc: 'Enterprise multi-facility volume discounts', icon: '🏗️' },
  { tier: 'Research', desc: 'Academic centers contributing de-identified data', icon: '🎓' },
  { tier: 'Freemium Pilot', desc: '90-day, 50-bed free tier for safety-net hospitals', icon: '🆓' },
]

const workflow = [
  { step: '1', label: 'Patient Admitted', desc: 'EHR data + wearables auto-ingest', icon: '🛏️' },
  { step: '2', label: 'Continuous Monitoring', desc: 'SentinelAI runs every 15 minutes', icon: '📊' },
  { step: '3', label: 'Risk Alert Fires', desc: 'CDS Hooks Card appears in EHR', icon: '🔔' },
  { step: '4', label: 'XAI Explanation', desc: 'SHAP report with SSC protocol actions', icon: '🔬' },
  { step: '5', label: 'Clinical Action', desc: 'Physician initiates Hour-1 Bundle', icon: '💊' },
  { step: '6', label: 'PDF Report Filed', desc: 'Audit-ready clinical documentation', icon: '📄' },
]

const valueBased = [
  { title: 'Shared Savings', desc: 'Revenue tied to sepsis mortality & LOS reduction', color: '#10b981' },
  { title: 'Payer Partnerships', desc: 'CMS ACO population-level burden reduction', color: '#3b82f6' },
  { title: 'Outcomes Reporting', desc: 'Quarterly RWE reports for ROI validation', color: '#a855f7' },
]

export default function IndustrySlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-[#3b82f6]/5 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-[#10b981]/5 blur-[100px]" />

      <div className="relative z-10 w-full max-w-6xl px-8 lg:px-12">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-4">
          <span className="tag-pill bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
            INDUSTRY & CLINICAL USE CASE
          </span>
        </motion.div>

        <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-3xl md:text-4xl font-bold mb-6">
          From Model to <span className="bg-gradient-to-r from-[#3b82f6] to-[#10b981] bg-clip-text text-transparent">Clinical Workflow</span>
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: EHR Workflow */}
          <div>
            <motion.h3 variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-[#22d3ee]/40" />
              Physician EHR Workflow (via FHIR)
            </motion.h3>
            <div className="space-y-2">
              {workflow.map((w, i) => (
                <motion.div key={w.step} variants={fadeUp} initial="hidden" animate="visible" custom={3 + i}
                  className="glass rounded-lg p-3 flex items-center gap-3 group hover:border-[#38bdf8]/20 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#22d3ee]/10 flex items-center justify-center text-sm shrink-0">
                    {w.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#f1f5f9]">{w.label}</div>
                    <div className="text-[10px] text-[#64748b]">{w.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono text-[#22d3ee]/40">0{w.step}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Business Model */}
          <div>
            <motion.h3 variants={fadeUp} initial="hidden" animate="visible" custom={9}
              className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-[#f59e0b]/40" />
              SaaS Sustainability Model
            </motion.h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {saasModel.map((s, i) => (
                <motion.div key={s.tier} variants={fadeUp} initial="hidden" animate="visible" custom={10 + i}
                  className="glass rounded-lg p-3 text-center">
                  <span className="text-lg block mb-1">{s.icon}</span>
                  <div className="text-xs font-semibold text-[#f1f5f9] mb-0.5">{s.tier}</div>
                  <div className="text-[9px] text-[#64748b] leading-tight">{s.desc}</div>
                </motion.div>
              ))}
            </div>

            <motion.h3 variants={fadeUp} initial="hidden" animate="visible" custom={14}
              className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-[#10b981]/40" />
              Value-Based Care Partnerships
            </motion.h3>
            <div className="space-y-2">
              {valueBased.map((v, i) => (
                <motion.div key={v.title} variants={fadeUp} initial="hidden" animate="visible" custom={15 + i}
                  className="glass rounded-lg p-3 flex items-center gap-3" style={{ borderLeft: `2px solid ${v.color}40` }}>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: v.color }}>{v.title}</div>
                    <div className="text-[10px] text-[#64748b]">{v.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={18}
              className="glass-strong rounded-xl p-3 mt-4 border-l-4 border-[#10b981]/50">
              <p className="text-[11px] text-[#94a3b8] italic leading-relaxed">
                "The most sustainable business model in clinical AI is one where your revenue goes up only when your patients do better."
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
