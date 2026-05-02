import { TransitionProvider, useTransition } from './context/TransitionContext'
import { AuthProvider } from './context/AuthContext'
import PageTransition from './components/shared/PageTransition'
import { Analytics } from '@vercel/analytics/react'
import LandingPage from './pages/LandingPage'
import ReaderPage from './pages/ReaderPage'

function AppContent() {
  const { currentPage } = useTransition()

  return (
    <>
      {currentPage === 'landing' ? <LandingPage /> : <ReaderPage />}
      <PageTransition />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TransitionProvider>
        <AppContent />
      </TransitionProvider>
      <Analytics />
    </AuthProvider>
  )
}
