import type { CompoundStatus, LeaderboardEntry, PaperTrade, StrategyInstance } from "@/lib/api-client"
import type { Metadata } from "next"

import { api } from "@/lib/api-client"

import { AutoRefresh } from "@/components/auto-refresh"
import { AllocationTable } from "./_components/allocation-table"
import { CompoundStats } from "./_components/compound-stats"
import { Leaderboard } from "./_components/leaderboard"
import { TradeHistory } from "./_components/trade-history"

export const metadata: Metadata = {
  title: "Capital Allocation",
}

export const dynamic = "force-dynamic"

export default async function CompounderPage() {
  const [compound, leaderboard, strategies, tradesResp] = await Promise.all([
    api.getCompoundStatus().catch(() => null as CompoundStatus | null),
    api.getLeaderboard().catch(() => ({ leaderboard: [] as LeaderboardEntry[] })),
    api.getStrategies().catch(() => [] as StrategyInstance[]),
    api.getPaperTrades(200).catch(() => ({ total: 0, trades: [] as PaperTrade[] })),
  ])

  // Merge size_usd from strategy instances into leaderboard entries
  const sizeMap = Object.fromEntries(strategies.map((s) => [s.name, s.size_usd]))
  const leaderboardWithSize = leaderboard.leaderboard.map((e) => ({
    ...e,
    size_usd: sizeMap[e.name] ?? 0,
  }))

  const winners = leaderboardWithSize.filter((e) => e.status === "running" && e.total_pnl > 0)
  const running = leaderboardWithSize.filter((e) => e.status === "running")

  return (
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <AutoRefresh interval={15000} />
      <div className="mx-auto max-w-[1800px] space-y-5 stagger-children">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Capital Allocation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Auto-compounder status, winner allocations, and full trade history.
          </p>
        </div>

        <CompoundStats compound={compound} winners={winners.length} running={running.length} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AllocationTable entries={running} />
          <Leaderboard entries={leaderboard.leaderboard} />
        </div>

        <TradeHistory trades={tradesResp.trades} total={tradesResp.total} />
      </div>
    </section>
  )
}
