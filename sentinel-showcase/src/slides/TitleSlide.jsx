import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function TitleSlide() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden grid-bg">
      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-blue/8 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-purple/8 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan/5 blur-[80px]" />

      {/* Scan line */}
      <div className="scan-line" />

      <div className="relative z-10 text-center px-8 max-w-5xl">
        {/* Pre-title badge */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="tag-pill bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 mb-8 inline-flex">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            Clinical Decision Support System
          </span>
        </motion.div>

        {/* Logo / Title */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mt-6 leading-[0.9]"
        >
          <span className="bg-gradient-to-r from-accent-sky via-accent-cyan to-accent-blue bg-clip-text text-transparent animate-gradient">
            Sentinel
          </span>
          <span className="text-text-primary">AI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-xl md:text-2xl lg:text-3xl text-text-secondary font-light mt-6 tracking-wide"
        >
          Predict<span className="text-accent-cyan mx-3">·</span>
          Explain<span className="text-accent-purple mx-3">·</span>
          <span className="text-accent-emerald font-medium">Save Lives</span>
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="text-base md:text-lg text-text-muted mt-6 max-w-2xl mx-auto leading-relaxed"
        >
          Real-Time, Multi-Modal Sepsis Forecasting — 48 Hours Before Onset
        </motion.p>

        {/* Author */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-border-glow" />
          <p className="text-sm text-text-muted font-medium tracking-widest uppercase">
            Prasanna Nadrajan
          </p>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-border-glow" />
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-text-muted/60 tracking-wider uppercase">Press → to begin</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-text-muted/30 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-accent-sky" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
