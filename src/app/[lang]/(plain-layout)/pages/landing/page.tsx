import { CTASection } from "./_components/cta-section"
import { Features } from "./_components/features"
import { Hero } from "./_components/hero"
import { HowItWorks } from "./_components/how-it-works"
import { Stats } from "./_components/stats"
import { TrustIndicators } from "./_components/trust-indicators"

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <TrustIndicators />
      <Stats />
      <Features />
      <HowItWorks />
      <CTASection />
    </div>
  )
}
