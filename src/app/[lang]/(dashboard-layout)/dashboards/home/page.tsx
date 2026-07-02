import type { DashboardStats, StrategyInstance } from "@/lib/api-client"
import type { Metadata } from "next"

import { api } from "@/lib/api-client"

import { HomeAlerts } from "./_components/home-alerts"
import { HomeBots } from "./_components/home-bots"
import { HomeHero } from "./_components/home-hero"
import { AutoRefresh } from "@/components/auto-refresh"

export const metadata: Metadata = {
  title: "Home",
}

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let stats: DashboardStats = {
    total_strategies: 0,
    running_strategies: 0,
    total_pnl: 0,
    total_trades: 0,
    win_rate: 0,
    vault_equity: 0,
    active_positions: 0,
  }
  let strategies: StrategyInstance[] = []
  let backendUp = true

  try {
    stats = await api.getDashboardStats()
  } catch {
    backendUp = false
  }
  try {
    strategies = await api.getStrategies()
  } catch {
    backendUp = false
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-1 text-base text-muted-foreground">
          Here&apos;s how your money is doing today.
        </p>
      </header>

      <HomeHero stats={stats} backendUp={backendUp} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <HomeBots strategies={strategies} backendUp={backendUp} />
        <HomeAlerts
          strategies={strategies}
          stats={stats}
          backendUp={backendUp}
        />
      </div>

      <AutoRefresh interval={30000} />
    </div>
  )
}
