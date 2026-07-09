import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TitleSlide from './slides/TitleSlide'
import ProblemSlide from './slides/ProblemSlide'
import SolutionSlide from './slides/SolutionSlide'
import ArchitectureSlide from './slides/ArchitectureSlide'
import XAISlide from './slides/XAISlide'
import MetricsSlide from './slides/MetricsSlide'
import IndustrySlide from './slides/IndustrySlide'

const slides = [
  { component: TitleSlide, label: 'Title' },
  { component: ProblemSlide, label: 'Problem' },
  { component: SolutionSlide, label: 'Solution' },
  { component: ArchitectureSlide, label: 'Architecture' },
  { component: XAISlide, label: 'XAI Engine' },
  { component: MetricsSlide, label: 'Metrics' },
  { component: IndustrySlide, label: 'Industry' },
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback((index) => {
    if (index < 0 || index >= slides.length || index === currentSlide) return
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }, [currentSlide])

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo])
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev])

  // Mouse wheel navigation
  useEffect(() => {
    let timeout = null
    const handleWheel = (e) => {
      if (timeout) return
      timeout = setTimeout(() => { timeout = null }, 800)
      if (e.deltaY > 30) next()
      else if (e.deltaY < -30) prev()
    }
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [next, prev])

  const CurrentComponent = slides[currentSlide].component

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg-deep">
      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots — right side */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {slides.map((slide, i) => (
          <button
            key={slide.label}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-end"
            aria-label={`Go to ${slide.label}`}
          >
            {/* Label tooltip */}
            <span className="absolute right-6 px-2 py-1 rounded text-[10px] font-medium text-[#f1f5f9] bg-[#111827]/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {slide.label}
            </span>
            <div className={`slide-indicator-dot w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? 'bg-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.5)] scale-125'
                : 'bg-[#334155] hover:bg-[#64748b]'
            }`} />
          </button>
        ))}
      </div>

      {/* Slide counter — bottom left */}
      <div className="fixed bottom-6 left-8 z-50 flex items-center gap-3">
        <span className="text-xs font-mono text-[#64748b]">
          <span className="text-[#38bdf8] font-bold">{String(currentSlide + 1).padStart(2, '0')}</span>
          <span className="mx-1 text-[#334155]">/</span>
          <span>{String(slides.length).padStart(2, '0')}</span>
        </span>
        <div className="w-24 h-0.5 bg-[#1e293b] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] rounded-full"
            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Navigation arrows — bottom right */}
      <div className="fixed bottom-6 right-8 z-50 flex items-center gap-2">
        <button
          onClick={prev}
          disabled={currentSlide === 0}
          className="w-8 h-8 rounded-lg bg-[#111827]/60 backdrop-blur border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#38bdf8]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous slide"
        >
          ←
        </button>
        <button
          onClick={next}
          disabled={currentSlide === slides.length - 1}
          className="w-8 h-8 rounded-lg bg-[#111827]/60 backdrop-blur border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#38bdf8]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next slide"
        >
          →
        </button>
      </div>
    </div>
  )
}
