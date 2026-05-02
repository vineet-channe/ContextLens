import { AnimatePresence, motion } from 'framer-motion'
import { useTransition } from '../../context/TransitionContext'

export default function PageTransition() {
  const { isTransitioning } = useTransition()

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-base)',
            zIndex: 9999,
            pointerEvents: 'all',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  )
}
