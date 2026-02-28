import type { StrategyInstance } from "@/lib/api-client"
import type { Metadata } from "next"
import type { StrategyDefinition } from "./_data/strategy"

import { fallbackStrategies, toStrategyDefinition } from "./_data/strategy"

import { api } from "@/lib/api-client"

import { StrategyLayout } from "./_components/strategy-layout"

export const metadata: Metadata = {
  title: "Trading Strategies",
}

export const dynamic = "force-dynamic"

export default async function StrategyPage() {
  let strategies: StrategyDefinition[] = fallbackStrategies
  let runningInstances: StrategyInstance[] = []

  try {
    const [registryResponse, instances] = await Promise.all([
      api.getStrategyRegistry(),
      api.getStrategies().catch(() => [] as StrategyInstance[]),
    ])

    if (registryResponse.available_strategies.length > 0) {
      strategies =
        registryResponse.available_strategies.map(toStrategyDefinition)
    }
    runningInstances = instances
  } catch {
    // Fall back to hardcoded strategies
  }

  return (
    <section className="page-grid-bg noise-overlay min-h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="mx-auto max-w-[1800px] space-y-5 stagger-children">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Trading Strategies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deploy and manage {strategies.length} algorithmic strategies on
            Hyperliquid perpetual markets.
          </p>
        </div>
        <StrategyLayout
          strategies={strategies}
          runningInstances={runningInstances}
        />
      </div>
    </section>
  )
}
