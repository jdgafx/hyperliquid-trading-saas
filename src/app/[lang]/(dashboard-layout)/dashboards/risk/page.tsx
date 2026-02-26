import type { Metadata } from "next"

import { RiskDashboard } from "./_components/risk-dashboard"

export const metadata: Metadata = {
  title: "Risk Controller",
}

export const dynamic = "force-dynamic"

export default async function RiskPage() {
  return (
    <section className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Risk Controller</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Layer 0: The Seatbelt &mdash; Protecting Your Capital
        </p>
      </div>
      <RiskDashboard />
    </section>
  )
}
