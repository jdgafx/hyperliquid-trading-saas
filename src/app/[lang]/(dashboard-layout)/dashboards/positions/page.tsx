import type { Metadata } from "next"
import type { OpenPosition, TradeHistory } from "./_data/positions"

import { openPositionsData, tradeHistoryData } from "./_data/positions"

import { api } from "@/lib/api-client"

import { PositionsTabs } from "./_components/positions-tabs"

export const metadata: Metadata = {
  title: "Positions",
}

export const dynamic = "force-dynamic"

export default async function PositionsPage() {
  let positions: OpenPosition[] = openPositionsData
  let history: TradeHistory[] = tradeHistoryData

  try {
    const [apiPositions, apiTrades] = await Promise.all([
      api.getPositions(),
      api.getTrades(50),
    ])

    if (apiPositions.length > 0) {
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

    const closedTrades = apiTrades.filter((t) => !t.is_open)
    if (closedTrades.length > 0) {
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
