import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stats = [
  { value: '270K+', label: 'Deaths annually in the U.S.', color: 'text-accent-rose' },
  { value: '11M', label: 'Deaths globally per year', color: 'text-accent-amber' },
  { value: '7-10%', label: 'Mortality increase per hour of delay', color: 'text-accent-rose' },
]

const blackBoxIssues = [
  { icon: '⊘', text: 'Clinician Rejection — Providers override alerts they can\'t understand', color: 'accent-rose' },
  { icon: '⊘', text: 'Regulatory Non-Compliance — FDA & EU MDR demand algorithmic transparency', color: 'accent-amber' },
  { icon: '⊘', text: 'Liability Exposure — Unexplained AI decisions create medico-legal risk', color: 'accent-rose' },
  { icon: '⊘', text: 'Algorithmic Bias — Hidden biases harm marginalized populations undetected', color: 'accent-purple' },
]

export default function ProblemSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Red ambient warning */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-rose/6 blur-[140px]" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-accent-amber/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-6xl px-8 lg:px-12">
        {/* Section header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-8">
          <span className="tag-pill bg-accent-rose/10 text-accent-rose border-accent-rose/20 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
            THE PROBLEM
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Golden Hour Crisis */}
          <div>
            <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              The <span className="text-accent-rose glow-text" style={{ textShadow: '0 0 30px rgba(244,63,94,0.4)' }}>Golden Hour</span> Crisis
            </motion.h2>

            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-text-secondary text-sm leading-relaxed mb-6">
              Sepsis is the <span className="text-text-primary font-medium">leading cause of preventable in-hospital death</span>. 
              Organ failure can begin within hours of onset. Current early warning scores 
              (NEWS, MEWS, qSOFA) are <span className="text-accent-amber font-medium">reactive</span> — flagging 
              deterioration <em>after</em> it begins, not before.
            </motion.p>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={3 + i}
                  className="glass rounded-xl p-4 text-center"
                >
                  <div className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-text-muted mt-1 leading-tight">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Black Box Issue */}
          <div>
            <motion.h2 variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              The <span className="text-accent-amber" style={{ textShadow: '0 0 30px rgba(245,158,11,0.3)' }}>Black Box</span> AI Barrier
            </motion.h2>

            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="text-text-secondary text-sm leading-relaxed mb-5">
              A model that outputs <code className="text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded text-xs font-mono">"Sepsis Risk: 87%"</code> with 
              no justification is <span className="text-text-primary font-medium">clinically unusable</span>.
            </motion.p>

            <div className="space-y-3">
              {blackBoxIssues.map((issue, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5 + i}
                  className={`flex items-start gap-3 glass rounded-lg p-3 border-l-2 border-${issue.color}/40`}
                >
                  <span className={`text-${issue.color} text-sm mt-0.5 shrink-0`}>{issue.icon}</span>
                  <span className="text-text-secondary text-xs leading-relaxed">{issue.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom principle */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={10}
          className="mt-8 glass-strong rounded-xl p-4 border-l-4 border-accent-cyan/50 max-w-4xl mx-auto"
        >
          <p className="text-sm text-text-secondary italic leading-relaxed">
            <span className="text-accent-cyan font-semibold not-italic">SentinelAI's Principle:</span>{' '}
            Predictive power without explainability is not clinical progress — it is a liability. 
            Every inference is <span className="text-text-primary font-medium">auditable, interpretable, and defensible</span>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
