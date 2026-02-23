import type { Metadata } from "next"

import { ActivePositions } from "./_components/active-positions"
import { TradingOverview } from "./_components/overview"
import { PortfolioPerformance } from "./_components/portfolio-performance"
import { RecentTrades } from "./_components/recent-trades"

export const metadata: Metadata = {
  title: "Trading Overview",
}

export default function TradingPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <TradingOverview />
      <PortfolioPerformance />
      <RecentTrades />
      <ActivePositions />
    </section>
  )
}
