import type { Metadata } from "next"

import { StrategyDetail } from "./_components/strategy-detail"

export const metadata: Metadata = {
  title: "Strategy Detail",
}

export const dynamic = "force-dynamic"

export default function StrategyDetailPage() {
  return (
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] stagger-children">
        <StrategyDetail />
      </div>
    </section>
  )
}
