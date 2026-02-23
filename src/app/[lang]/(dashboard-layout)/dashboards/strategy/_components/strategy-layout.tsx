"use client"

import { useState } from "react"

import type { StrategyStatus } from "@/lib/api-client"

import { strategies } from "../_data/strategy"

import { StrategyCard } from "./strategy-card"
import { TradingPairSelector } from "./trading-pair-selector"

interface StrategyLayoutProps {
  activeStrategy: StrategyStatus | null
}

export function StrategyLayout({ activeStrategy }: StrategyLayoutProps) {
  const [selectedPair, setSelectedPair] = useState("BTC")

  const liveCount = strategies.filter((s) => s.status === "live").length
  const comingSoonCount = strategies.filter(
    (s) => s.status === "coming-soon"
  ).length

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
            {liveCount} live · {comingSoonCount} coming soon
          </p>
        </div>
        <span className="rounded-full border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
          {strategies.length} total
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            activeStrategy={activeStrategy}
            selectedPair={selectedPair}
          />
        ))}
      </div>
    </div>
  )
}
