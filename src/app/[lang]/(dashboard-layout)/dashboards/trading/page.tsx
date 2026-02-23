import type { Metadata } from "next"
import type {
  ActivePosition,
  PerformanceDataPoint,
  RecentTrade,
  TradingOverviewData,
} from "./types"

import { api } from "@/lib/api-client"

import { ActivePositions } from "./_components/active-positions"
import { TradingOverview } from "./_components/overview"
import { PortfolioPerformance } from "./_components/portfolio-performance"
import { RecentTrades } from "./_components/recent-trades"

export const metadata: Metadata = {
  title: "Trading Overview",
}

export const dynamic = "force-dynamic"

export default async function TradingPage() {
  let overviewData: TradingOverviewData = {
    vaultEquity: { value: 0, percentageChange: 0, perDay: [] },
    navPerShare: { value: 0, percentageChange: 0, perDay: [] },
    portfolioValue: { value: 0, percentageChange: 0, perDay: [] },
    unrealizedPnl: { value: 0, percentageChange: 0, perDay: [] },
  }
  let positions: ActivePosition[] = []
  let trades: RecentTrade[] = []
  const perfData: PerformanceDataPoint[] = []

  try {
    const [vaultStatus, apiPositions, apiTrades] = await Promise.all([
      api.getVaultStatus(),
      api.getPositions(),
      api.getTrades(10),
    ])

    // Map vault status to overview card format
    overviewData = {
      vaultEquity: {
        value: vaultStatus.total_equity,
        percentageChange: 0,
        perDay: [],
      },
      navPerShare: {
        value: vaultStatus.nav_per_share,
        percentageChange: 0,
        perDay: [],
      },
      portfolioValue: {
        value: vaultStatus.live_equity ?? vaultStatus.total_equity,
        percentageChange: 0,
        perDay: [],
      },
      unrealizedPnl: {
        value:
          (vaultStatus.live_equity ?? vaultStatus.total_equity) -
          vaultStatus.total_equity,
        percentageChange: 0,
        perDay: [],
      },
    }

    // Map API positions to component format
    positions = apiPositions.map((p) => ({
      symbol: p.symbol,
      side: p.side,
      size: p.size,
      entryPrice: p.entry_price,
      markPrice: p.mark_price,
      unrealizedPnl: p.unrealized_pnl,
      leverage: p.leverage,
    }))

    // Map API trades to component format
    trades = apiTrades.map((t) => ({
      id: t.id,
      symbol: t.symbol,
      side: t.side,
      size: t.size,
      entryPrice: t.entry_price,
      pnl: t.pnl,
      status: (t.is_open ? "open" : "closed") as "open" | "closed",
    }))
  } catch (error) {
    console.error("Failed to fetch trading data:", error)
  }

  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <TradingOverview data={overviewData} />
      <PortfolioPerformance data={perfData} />
      <RecentTrades data={trades} />
      <ActivePositions data={positions} />
    </section>
  )
}
