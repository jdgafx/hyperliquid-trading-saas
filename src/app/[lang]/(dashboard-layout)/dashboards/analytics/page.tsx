import type { Trade, VaultStatus } from "@/lib/api-client"
import type { Metadata } from "next"

import { api } from "@/lib/api-client"

import { EquityCurve } from "./_components/equity-curve"
import { PerformanceMetrics } from "./_components/performance-metrics"
import { PerformanceOverview } from "./_components/performance-overview"
import { TradeDistribution } from "./_components/trade-distribution"

export const metadata: Metadata = {
  title: "Performance",
}

export const dynamic = "force-dynamic"

export default async function PerformancePage() {
  let trades: Trade[] = []
  let vaultStatus: VaultStatus | null = null

  try {
    const [apiTrades, apiVault] = await Promise.all([
      api.getTrades(500),
      api.getVaultStatus(),
    ])
    trades = apiTrades
    vaultStatus = apiVault
  } catch (error) {
    console.error("Failed to fetch performance data:", error)
  }

  const closedTrades = trades.filter((t) => !t.is_open)
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
  const winRate =
    closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0
  const bestTrade =
    closedTrades.length > 0
      ? Math.max(...closedTrades.map((t) => t.pnl ?? 0))
      : 0
  const worstTrade =
    closedTrades.length > 0
      ? Math.min(...closedTrades.map((t) => t.pnl ?? 0))
      : 0

  const sortedTrades = [...closedTrades].sort(
    (a, b) =>
      new Date(a.closed_at ?? a.opened_at).getTime() -
      new Date(b.closed_at ?? b.opened_at).getTime()
  )

  const equityCurve = sortedTrades.reduce(
    (acc, trade) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].equity : 0
      acc.push({
        date: trade.closed_at ?? trade.opened_at,
        equity: prev + (trade.pnl ?? 0),
        pnl: trade.pnl ?? 0,
      })
      return acc
    },
    [] as Array<{ date: string; equity: number; pnl: number }>
  )

  let maxDrawdown = 0
  let peak = 0
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity
    const drawdown = peak - point.equity
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }

  const metrics = {
    totalPnl,
    winRate,
    totalTrades: closedTrades.length,
    bestTrade,
    worstTrade,
    maxDrawdown,
    sharpeRatio: 0,
    vaultEquity: vaultStatus?.total_equity ?? 0,
  }
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <PerformanceOverview metrics={metrics} />
      <EquityCurve data={equityCurve} />
      <TradeDistribution trades={closedTrades} />
      <PerformanceMetrics metrics={metrics} />
    </section>
  )
}
