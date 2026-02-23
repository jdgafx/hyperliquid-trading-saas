"use client"

import { useState } from "react"

import type { StrategyConfig, StrategyStatus } from "@/lib/api-client"
import type { StrategyDefinition } from "../_data/strategy"

import { api } from "@/lib/api-client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const CATEGORY_STYLES = {
  trend: {
    label: "Trend Following",
    icon: "↗",
    textColor: "text-sky-400",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/20",
    iconBg: "bg-sky-500/10",
    borderLeft: "border-l-sky-500",
  },
  "mean-reversion": {
    label: "Mean Reversion",
    icon: "⇅",
    textColor: "text-violet-400",
    badgeBg: "bg-violet-500/10",
    badgeBorder: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
    borderLeft: "border-l-violet-500",
  },
  "market-making": {
    label: "Market Making",
    icon: "⇄",
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    borderLeft: "border-l-amber-500",
  },
  statistical: {
    label: "Statistical",
    icon: "∑",
    textColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    borderLeft: "border-l-emerald-500",
  },
} as const

const RISK_STYLES = {
  low: {
    label: "Low",
    bars: 1,
    barColor: "bg-emerald-500",
    textColor: "text-emerald-500",
  },
  medium: {
    label: "Medium",
    bars: 2,
    barColor: "bg-amber-500",
    textColor: "text-amber-500",
  },
  high: {
    label: "High",
    bars: 3,
    barColor: "bg-red-500",
    textColor: "text-red-500",
  },
} as const

interface StrategyCardProps {
  strategy: StrategyDefinition
  activeStrategy: StrategyStatus | null
  selectedPair: string
}

export function StrategyCard({
  strategy,
  activeStrategy,
  selectedPair,
}: StrategyCardProps) {
  const isLive = strategy.status === "live"
  const initiallyRunning = isLive && activeStrategy?.status === "running"

  const [isRunning, setIsRunning] = useState(initiallyRunning)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const cat = CATEGORY_STYLES[strategy.category]
  const risk = RISK_STYLES[strategy.riskLevel]
  const paramEntries = Object.entries(strategy.params)

  async function handleStart() {
    setIsLoading(true)
    setError("")
    const p = strategy.params
    const config: StrategyConfig = {
      symbol: selectedPair,
      timeframe: String(p.timeframe?.default ?? "1h"),
      lookback_period: Number(p.lookback_period?.default ?? 55),
      atr_period: Number(p.atr_period?.default ?? 14),
      atr_multiplier: Number(p.atr_multiplier?.default ?? 2.5),
      leverage: Number(p.leverage?.default ?? 3),
    }
    try {
      await api.startStrategy(config)
      setIsRunning(true)
    } catch {
      setError("Failed to start strategy")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStop() {
    setIsLoading(true)
    setError("")
    try {
      await api.stopStrategy()
      setIsRunning(false)
    } catch {
      setError("Failed to stop strategy")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={`relative flex flex-col overflow-hidden border-l-2 ${cat.borderLeft} transition-all duration-200 hover:shadow-md`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold ${cat.iconBg} ${cat.textColor}`}
            >
              {cat.icon}
            </div>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cat.textColor} ${cat.badgeBg} ${cat.badgeBorder}`}
            >
              {cat.label}
            </span>
          </div>

          {isLive ? (
            isRunning ? (
              <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Running
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 text-emerald-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
                Live
              </Badge>
            )
          ) : (
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <span className="text-base leading-none">◷</span>
              Coming Soon
            </Badge>
          )}
        </div>

        <div className="mt-2">
          <h3 className="text-base font-bold tracking-tight">
            {strategy.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {strategy.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Parameters
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {paramEntries.map(([key, param]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-1"
              >
                <span className="truncate text-[11px] text-muted-foreground">
                  {param.label}
                </span>
                <span className="shrink-0 font-mono text-[11px] font-semibold">
                  {String(param.default)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Risk</span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {([1, 2, 3] as const).map((bar) => (
                <div
                  key={bar}
                  className={`h-3 w-1.5 rounded-sm ${
                    bar <= risk.bars ? risk.barColor : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-semibold ${risk.textColor}`}>
              {risk.label}
            </span>
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          {isLive ? (
            <>
              <Button
                size="sm"
                className="flex-1 gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                onClick={handleStart}
                disabled={isLoading || isRunning}
              >
                ▶ {isLoading && !isRunning ? "Starting…" : "Start"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 gap-1.5 text-xs"
                onClick={handleStop}
                disabled={isLoading || !isRunning}
              >
                ■ {isLoading && isRunning ? "Stopping…" : "Stop"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="w-full cursor-not-allowed text-xs opacity-50"
              disabled
            >
              Coming Soon
            </Button>
          )}
        </div>

        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
