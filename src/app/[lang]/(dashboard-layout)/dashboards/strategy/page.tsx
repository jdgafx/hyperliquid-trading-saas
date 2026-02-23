import type { Metadata } from "next"
import type { StrategyStatusData } from "./_data/strategy"

import { strategyStatusData } from "./_data/strategy"

import { api } from "@/lib/api-client"

import { StrategyConfigForm } from "./_components/strategy-config-form"
import { StrategyControls } from "./_components/strategy-controls"
import { StrategyStatus } from "./_components/strategy-status"

export const metadata: Metadata = {
  title: "Strategy",
}

export const dynamic = "force-dynamic"

export default async function StrategyPage() {
  let strategyData: StrategyStatusData = strategyStatusData

  try {
    const status = await api.getStrategyStatus()

    strategyData = {
      name: status.name,
      status: status.status === "running" ? "running" : "stopped",
      symbol: status.symbol,
      timeframe: status.timeframe,
      lookbackPeriod: status.lookback_period,
      atrPeriod: status.atr_period,
      atrMultiplier: status.atr_multiplier,
      leverage: status.leverage,
      lastSignal: status.last_signal,
      lastSignalTime: status.last_signal_time,
    }
  } catch (error) {
    console.error("Failed to fetch strategy data:", error)
  }

  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <StrategyStatus data={strategyData} />
      </div>
      <StrategyControls initialRunning={strategyData.status === "running"} />
      <StrategyConfigForm data={strategyData} />
    </section>
  )
}
