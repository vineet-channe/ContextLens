import { createContext, useContext, useState, useCallback } from 'react'

const TransitionContext = createContext(null)

export function TransitionProvider({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPage, setCurrentPage] = useState('landing') // 'landing' | 'reader'
  const [pageState, setPageState] = useState(null) // optional data passed to the target page

  const navigateTo = useCallback((page, state = null) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage(page)
      setPageState(state)
      // Give the new page a frame to render before fading back in
      setTimeout(() => setIsTransitioning(false), 60)
    }, 320)
  }, [])

  return (
    <TransitionContext.Provider value={{ currentPage, isTransitioning, navigateTo, pageState }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransition() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransition must be used within TransitionProvider')
  return ctx
}
