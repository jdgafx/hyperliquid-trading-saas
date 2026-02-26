import type { Metadata } from "next"

import { LiquidationsDashboard } from "./_components/liquidations-dashboard"

export const metadata: Metadata = {
  title: "Liquidation Intelligence",
}

export const dynamic = "force-dynamic"

export default function LiquidationsPage() {
  return (
    <section className="container p-4 md:p-6">
      <LiquidationsDashboard />
    </section>
  )
}
