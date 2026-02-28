import type { Metadata } from "next"

import { PortfolioDashboard } from "./_components/portfolio-dashboard"

export const metadata: Metadata = {
  title: "Portfolio Overview",
}

export const dynamic = "force-dynamic"

export default function PortfolioPage() {
  return (
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5 stagger-children">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Portfolio Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Combined performance across all running strategies and allocations.
          </p>
        </div>
        <PortfolioDashboard />
      </div>
    </section>
  )
}
