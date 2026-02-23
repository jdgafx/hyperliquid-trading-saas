import type { StrategyStatus } from "@/lib/api-client"
import type { Metadata } from "next"

import { api } from "@/lib/api-client"

import { StrategyLayout } from "./_components/strategy-layout"

export const metadata: Metadata = {
  title: "Strategy",
}

export const dynamic = "force-dynamic"

export default async function StrategyPage() {
  let activeStrategy: StrategyStatus | null = null

  try {
    const status = await api.getStrategyStatus()
    activeStrategy = status
  } catch {
    activeStrategy = null
  }

  return (
    <section className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Trading Strategies
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deploy and manage algorithmic strategies on Hyperliquid perpetual
          markets.
        </p>
      </div>
      <StrategyLayout activeStrategy={activeStrategy} />
    </section>
  )
}
