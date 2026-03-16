import type { Metadata } from "next"
import type { OpenPosition, TradeHistory } from "./_data/positions"

import { api } from "@/lib/api-client"

import { PositionsTabs } from "./_components/positions-tabs"

export const metadata: Metadata = {
  title: "Positions",
}

export const dynamic = "force-dynamic"

export default async function PositionsPage() {
  let positions: OpenPosition[] = []
  let history: TradeHistory[] = []

  try {
    // Try paper positions first (paper trading mode), fall back to standard endpoint
    const [paperPositions, paperTrades, apiPositions, apiTrades] =
      await Promise.all([
        api.getPaperPositions().catch(() => null),
        api.getPaperTrades(50).catch(() => null),
        api.getPositions().catch(() => []),
        api.getTrades(50).catch(() => []),
      ])

    // Use paper positions if available and non-empty, otherwise fall back
    if (paperPositions && paperPositions.positions.length > 0) {
      positions = paperPositions.positions.map((p) => ({
        symbol: p.symbol,
        side: p.side,
        size: p.size,
        entryPrice: p.entry_price,
        markPrice: p.mark_price,
        unrealizedPnl: p.unrealized_pnl,
        leverage: p.leverage,
      }))
    } else {
      positions = apiPositions.map((p) => ({
        symbol: p.symbol,
        side: p.side,
        size: p.size,
        entryPrice: p.entry_price,
        markPrice: p.mark_price,
        unrealizedPnl: p.unrealized_pnl,
        leverage: p.leverage,
      }))
    }

    // Use paper trades if available, otherwise fall back to standard trades
    if (paperTrades && paperTrades.trades.length > 0) {
      // Paper trades include both entry and exit; show exit actions as history
      const exitTrades = paperTrades.trades.filter((t) => t.action === "exit")
      history = exitTrades.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        size: t.size,
        entryPrice: t.price,
        exitPrice: t.price,
        pnl: t.pnl,
        exitReason: t.reason || "closed",
        openedAt: t.timestamp,
        closedAt: t.timestamp,
      }))
    } else {
      const closedTrades = apiTrades.filter((t) => !t.is_open)
      history = closedTrades.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        size: t.size,
        entryPrice: t.entry_price,
        exitPrice: t.exit_price ?? 0,
        pnl: t.pnl ?? 0,
        exitReason: t.exit_reason ?? "unknown",
        openedAt: t.opened_at,
        closedAt: t.closed_at ?? "",
      }))
    }
  } catch (error) {
    console.error("Failed to fetch positions data:", error)
  }

  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <PositionsTabs positions={positions} history={history} />
    </section>
  )
}
