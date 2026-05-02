import { useRef } from 'react'
import LandingNav from '../components/landing/LandingNav'
import HeroSection from '../components/landing/HeroSection'
import HowItWorks from '../components/landing/HowItWorks'
import FeatureCards from '../components/landing/FeatureCards'
import CTABanner from '../components/landing/CTABanner'
import Footer from '../components/landing/Footer'
import UserPapers from '../components/landing/UserPapers'
import { useMouseGlow } from '../hooks/useMouseGlow'
import { useMagneticText } from '../hooks/useMagneticText'
import { useCursorTrail } from '../hooks/useCursorTrail'

export default function LandingPage() {
  const pageRef = useRef(null)

  useMouseGlow(pageRef)
  useMagneticText('.magnetic-word', pageRef)
  useCursorTrail(pageRef)

  return (
    <div
      ref={pageRef}
      style={{
        position: 'relative',
        background: 'var(--bg-base)',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <LandingNav />
      <HeroSection />
      <UserPapers />
      <HowItWorks />
      <FeatureCards />
      <CTABanner />
      <Footer />
    </div>
  )
}
