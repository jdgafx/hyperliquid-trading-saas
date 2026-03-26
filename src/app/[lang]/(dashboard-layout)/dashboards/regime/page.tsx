import type { Metadata } from "next"

import { RegimeDashboard } from "./_components/regime-dashboard"

export const metadata: Metadata = {
  title: "Market Regime",
}

export const dynamic = "force-dynamic"

// ---------- Types ----------

interface RegimeInfo {
  symbol: string
  regime: string
  confidence: number
  duration_hours: number
  recommended_strategies: string[]
  avoid_strategies: string[]
}

interface VolatilityStatus {
  symbol: string
  atr_14?: number
  atr_pct?: number
  atr_value?: number
  atr_percentile?: number
  level?: string
  volatility_regime?: string
  is_volatile?: boolean
  should_pause?: boolean
  message?: string
}

interface StrategyRegimeEntry {
  strategy: string
  trending_up: string
  trending_down: string
  mean_reverting: string
  high_volatility: string
  low_volatility: string
}

// ---------- Data fetching ----------

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchRegimes(): Promise<RegimeInfo[]> {
  try {
    const res = await fetch(`${BASE_URL}/regime/current?symbols=BTC,ETH,SOL`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    // API returns "current_regime" but we expect "regime"
    return data.map(
      (d: Record<string, unknown>) =>
        ({
          ...d,
          regime: d.current_regime ?? d.regime ?? "UNKNOWN",
        }) as RegimeInfo
    )
  } catch {
    return []
  }
}

async function fetchVolatility(): Promise<VolatilityStatus[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/regime/volatility?symbols=BTC,ETH,SOL`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function fetchStrategyMap(): Promise<StrategyRegimeEntry[]> {
  try {
    const res = await fetch(`${BASE_URL}/regime/strategy-map`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    // API returns {strategy_type, favorable_regimes[], unfavorable_regimes[]}
    // but component expects {strategy, trending_up: "good", ...} per-regime ratings
    return data.map(
      (d: {
        strategy_type?: string
        strategy?: string
        favorable_regimes?: string[]
        unfavorable_regimes?: string[]
        trending_up?: string
      }) => {
        // If already in expected format, pass through
        if (d.trending_up !== undefined) return d as StrategyRegimeEntry
        // Transform from API format
        const favs = d.favorable_regimes ?? []
        const avoids = d.unfavorable_regimes ?? []
        const rate = (regime: string) =>
          avoids.includes(regime)
            ? "avoid"
            : favs.includes(regime)
              ? "good"
              : "neutral"
        return {
          strategy: d.strategy_type ?? d.strategy ?? "unknown",
          trending_up: rate("trending_up"),
          trending_down: rate("trending_down"),
          mean_reverting: rate("mean_reverting"),
          high_volatility: rate("high_volatility"),
          low_volatility: rate("low_volatility"),
        } as StrategyRegimeEntry
      }
    )
  } catch {
    return []
  }
}

export default async function RegimePage() {
  const [regimes, volatility, strategyMap] = await Promise.all([
    fetchRegimes(),
    fetchVolatility(),
    fetchStrategyMap(),
  ])

  return (
    <section className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Market Regime</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Know which market you&apos;re in. Jim Simons&apos; approach.
        </p>
      </div>
      <RegimeDashboard
        initialRegimes={regimes}
        initialVolatility={volatility}
        initialStrategyMap={strategyMap}
      />
    </section>
  )
}
