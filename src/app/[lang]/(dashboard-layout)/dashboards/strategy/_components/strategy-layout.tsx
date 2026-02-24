"use client"

import { useState } from "react"

import type { StrategyInstance } from "@/lib/api-client"
import type { StrategyDefinition, StrategyTier } from "../_data/strategy"

import { StrategyCard } from "./strategy-card"
import { TradingPairSelector } from "./trading-pair-selector"

const TIER_LABELS: Record<StrategyTier, { label: string; color: string }> = {
  A: { label: "Tier A - HL Native", color: "text-primary" },
  B: { label: "Tier B - Bonus", color: "text-amber-500" },
  C: { label: "Tier C - Bootcamp", color: "text-muted-foreground" },
}

interface StrategyLayoutProps {
  strategies: StrategyDefinition[]
  runningInstances: StrategyInstance[]
}

export function StrategyLayout({
  strategies,
  runningInstances,
}: StrategyLayoutProps) {
  const [selectedPair, setSelectedPair] = useState("BTC")

  // Build a set of running strategy types for quick lookup
  const runningTypes = new Set(
    runningInstances
      .filter((i) => i.status === "running")
      .map((i) => i.strategy_type)
  )

  // Group by tier
  const byTier: Record<StrategyTier, StrategyDefinition[]> = {
    A: [],
    B: [],
    C: [],
  }
  for (const s of strategies) {
    const tier = s.tier ?? "C"
    if (!byTier[tier]) byTier[tier] = []
    byTier[tier].push(s)
  }

  const tierOrder: StrategyTier[] = ["A", "B", "C"]

  return (
    <div className="flex flex-col gap-6">
      <TradingPairSelector
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">All Strategies</h2>
          <p className="text-xs text-muted-foreground">
            {strategies.length} available ·{" "}
            {runningInstances.filter((i) => i.status === "running").length}{" "}
            running
          </p>
        </div>
        <span className="rounded-full border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
          {strategies.length} total
        </span>
      </div>

      {tierOrder.map((tier) => {
        const tierStrategies = byTier[tier]
        if (!tierStrategies || tierStrategies.length === 0) return null
        const tierMeta = TIER_LABELS[tier]

        return (
          <div key={tier} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${tierMeta.color}`}
              >
                {tierMeta.label}
              </h3>
              <span className="text-xs text-muted-foreground">
                ({tierStrategies.length})
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tierStrategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  isRunning={runningTypes.has(strategy.id)}
                  selectedPair={selectedPair}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
