import type { StrategyInstance } from "@/lib/api-client"
import type { Metadata } from "next"
import type { StrategyDefinition } from "./_data/strategy"

import { fallbackStrategies, toStrategyDefinition } from "./_data/strategy"

import { api } from "@/lib/api-client"

import { StrategyLayout } from "./_components/strategy-layout"

export const metadata: Metadata = {
  title: "Strategy",
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
      <StrategyLayout
        strategies={strategies}
        runningInstances={runningInstances}
      />
    </section>
  )
}
