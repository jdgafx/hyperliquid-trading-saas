import type { Metadata } from "next"

import { BacktestDashboard } from "./_components/backtest-dashboard"

export const metadata: Metadata = {
  title: "Backtesting Lab",
}

export const dynamic = "force-dynamic"

interface StrategyRegistryEntry {
  name: string
  description: string
  tier: string
}

interface StrategyRegistryResponse {
  available_strategies: StrategyRegistryEntry[]
}

async function fetchRegistry(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/strategies/registry`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data: StrategyRegistryResponse = await res.json()
    return data.available_strategies.map((s) => s.name)
  } catch {
    return []
  }
}

interface BacktestSummary {
  id: string
  strategy_type: string
  symbol: string
  timeframe: string
  return_pct: number
  sharpe_ratio: number
  max_drawdown_pct: number
  total_trades: number
  created_at: string
}

async function fetchHistory(): Promise<BacktestSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/backtest/history`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function BacktestPage() {
  const [strategies, history] = await Promise.all([
    fetchRegistry(),
    fetchHistory(),
  ])

  const fallbackStrategies = [
    "turtle",
    "bollinger",
    "supply_demand_zone",
    "vwap_bot",
    "funding_arb",
    "correlation",
    "consolidation_pop",
    "nadaraya_watson",
    "market_maker",
    "mean_reversion",
    "sma_crossover",
    "rsi",
    "vwma",
  ]

  return (
    <section className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Backtesting Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Test strategies before risking real capital. Always use 2x commission.
        </p>
      </div>
      <BacktestDashboard
        strategies={strategies.length > 0 ? strategies : fallbackStrategies}
        initialHistory={history}
      />
    </section>
  )
}
