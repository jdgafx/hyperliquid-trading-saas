import type { Metadata } from "next"

import { SniperDashboard } from "./_components/sniper-dashboard"

export const metadata: Metadata = {
  title: "Solana Sniper",
}

export const dynamic = "force-dynamic"

export default function SolanaSnipePage() {
  return (
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5 stagger-children">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solana Sniper</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan, filter, and paper-trade new Solana tokens with configurable
            risk parameters.
          </p>
        </div>
        <SniperDashboard />
      </div>
    </section>
  )
}
