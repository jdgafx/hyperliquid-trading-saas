import type { Metadata } from "next"

import { FeeCalculatorDashboard } from "./_components/fee-calculator-dashboard"

export const metadata: Metadata = {
  title: "Fee Calculator",
}

export const dynamic = "force-dynamic"

export default function FeesPage() {
  return (
    <section className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Days Until Death</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See how quickly trading fees will eat your account. Make the invisible
          visible.
        </p>
      </div>
      <FeeCalculatorDashboard />
    </section>
  )
}
