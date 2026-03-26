import type { DashboardStats, Position, Trade } from "@/lib/api-client"
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
    // Fetch all data independently so one failure doesn't block the rest
    const [vaultStatus, apiPositions, apiTrades, apiStats, apiStrategies] =
      await Promise.all([
        api.getVaultStatus().catch(() => null),
        api.getPositions().catch(() => [] as Position[]),
        api.getTrades(10).catch(() => [] as Trade[]),
        api.getDashboardStats().catch(() => null),
        api.getStrategies().catch(() => null),
      ])

    dashboardStats = apiStats

    // Map vault status to overview card format, enriched with dashboard stats
    const totalEquity =
      vaultStatus?.total_equity ?? dashboardStats?.vault_equity ?? 0
    const vaultEquity = dashboardStats?.vault_equity ?? totalEquity
    const portfolioVal = vaultStatus?.live_equity ?? totalEquity
    const unrealizedPnlValue = portfolioVal - totalEquity

    // Calculate PnL percentage relative to portfolio value (avoid division by zero)
    const pnlPct =
      dashboardStats && portfolioVal > 0
        ? (dashboardStats.total_pnl / portfolioVal) * 100
        : 0

    overviewData = {
      vaultEquity: {
        value: vaultEquity,
        percentageChange: 0,
        perDay: [],
      },
      navPerShare: {
        value: vaultStatus?.nav_per_share ?? 0,
        percentageChange: 0,
        perDay: [],
      },
      portfolioValue: {
        value: portfolioVal,
        percentageChange: pnlPct,
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

    // If positions/trades are empty, try to extract from running strategies
    if (positions.length === 0 && apiStrategies && apiStrategies.length > 0) {
      const runningStrategies = apiStrategies.filter(
        (s) => s.status === "running" && s.last_signal
      )
      // Show running strategies as pseudo-positions so the UI isn't empty
      positions = runningStrategies
        .filter((s) => s.last_signal && s.last_signal !== "none")
        .map((s) => ({
          symbol: s.symbol,
          side:
            s.last_signal === "buy" || s.last_signal === "long"
              ? "long"
              : "short",
          size: s.size_usd,
          entryPrice: 0,
          markPrice: 0,
          unrealizedPnl: s.total_pnl,
          leverage: s.leverage,
        }))
    }

    // If trades are empty, build summary entries from strategies that have traded
    if (trades.length === 0 && apiStrategies && apiStrategies.length > 0) {
      const tradedStrategies = apiStrategies.filter((s) => s.total_trades > 0)
      trades = tradedStrategies.map((s, idx) => ({
        id: s.id ?? idx,
        symbol: s.symbol,
        side: "long",
        size: s.size_usd,
        entryPrice: 0,
        pnl: s.total_pnl,
        status:
          s.status === "running" ? ("open" as const) : ("closed" as const),
      }))
    }
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
