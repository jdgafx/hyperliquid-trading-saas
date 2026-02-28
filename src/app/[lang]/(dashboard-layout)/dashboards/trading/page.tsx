import type { DashboardStats } from "@/lib/api-client"
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
  let dashboardStats: DashboardStats | null = null

  try {
    const [vaultStatus, apiPositions, apiTrades, apiStats] = await Promise.all([
      api.getVaultStatus(),
      api.getPositions(),
      api.getTrades(10),
      api.getDashboardStats().catch(() => null),
    ])

    dashboardStats = apiStats

    // Map vault status to overview card format, enriched with dashboard stats
    const vaultEquity = dashboardStats?.vault_equity ?? vaultStatus.total_equity
    const unrealizedPnlValue =
      (vaultStatus.live_equity ?? vaultStatus.total_equity) -
      vaultStatus.total_equity

    overviewData = {
      vaultEquity: {
        value: vaultEquity,
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
        percentageChange: dashboardStats ? dashboardStats.total_pnl : 0,
        perDay: [],
      },
      unrealizedPnl: {
        value: unrealizedPnlValue,
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
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5 stagger-children">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Trading Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time portfolio performance, positions, and trade activity.
          </p>
        </div>

        {/* Hero metrics row - full width, 4 cards + quick stats */}
        <TradingOverview data={overviewData} stats={dashboardStats} />

        {/* Main content: chart takes 2/3, positions take 1/3 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PortfolioPerformance data={perfData} />
          </div>
          <div className="lg:col-span-1">
            <ActivePositions data={positions} />
          </div>
        </div>

        {/* Recent trades - full width bottom section */}
        <RecentTrades data={trades} />
      </div>
    </section>
  )
}
