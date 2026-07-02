import type {
  CompoundStatus,
  PaperTrade,
  StrategyInstance,
} from "@/lib/api-client"
import type { Metadata } from "next"

import { api } from "@/lib/api-client"

import { AllocationTable } from "./_components/allocation-table"
import { CompoundStats } from "./_components/compound-stats"
import { Leaderboard } from "./_components/leaderboard"
import { TradeHistory } from "./_components/trade-history"
import { AutoRefresh } from "@/components/auto-refresh"

export const metadata: Metadata = {
  title: "Capital Allocation",
}

export const dynamic = "force-dynamic"

export default async function CompounderPage() {
  const [compound, strategies, tradesResp] = await Promise.all([
    api.getCompoundStatus().catch(() => null as CompoundStatus | null),
    api.getStrategies().catch(() => [] as StrategyInstance[]),
    api
      .getPaperTrades(200)
      .catch(() => ({ total: 0, trades: [] as PaperTrade[] })),
  ])

  // Leaderboard entries derived from /strategies — the single endpoint that
  // actually carries status/total_pnl/trade counts per instance. (The old
  // /strategies/leaderboard response drifted to a different shape and
  // crashed this page's RSC render — 2026-07-02.)
  const leaderboardWithSize = strategies.map((s) => ({
    name: s.name,
    strategy_type: s.strategy_type,
    status: s.status,
    total_pnl: s.total_pnl ?? 0,
    total_trades: s.total_trades ?? 0,
    winning_trades: s.winning_trades ?? 0,
    losing_trades: s.losing_trades ?? 0,
    win_rate: s.total_trades
      ? (100 * (s.winning_trades ?? 0)) / s.total_trades
      : 0,
    profitable: (s.total_pnl ?? 0) > 0,
    avg_pnl_per_trade: s.total_trades ? (s.total_pnl ?? 0) / s.total_trades : 0,
    size_usd: s.size_usd ?? 0,
  }))

  const winners = leaderboardWithSize.filter(
    (e) => e.status === "running" && e.total_pnl > 0
  )
  const running = leaderboardWithSize.filter((e) => e.status === "running")

  return (
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <AutoRefresh interval={15000} />
      <div className="mx-auto max-w-[1800px] space-y-5 stagger-children">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Capital Allocation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Auto-compounder status, winner allocations, and full trade history.
          </p>
        </div>

        <CompoundStats
          compound={compound}
          winners={winners.length}
          running={running.length}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AllocationTable entries={running} />
          <Leaderboard entries={leaderboardWithSize} />
        </div>

        <TradeHistory trades={tradesResp.trades} total={tradesResp.total} />
      </div>
    </section>
  )
}
