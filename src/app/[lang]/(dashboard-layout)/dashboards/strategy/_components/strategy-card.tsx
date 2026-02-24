"use client"

import { useState } from "react"

import type {
  ProfitHorizon,
  StrategyCategory,
  StrategyDefinition,
} from "../_data/strategy"

import { api } from "@/lib/api-client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const CATEGORY_STYLES: Record<
  StrategyCategory,
  {
    label: string
    icon: string
    textColor: string
    badgeBg: string
    badgeBorder: string
    iconBg: string
    borderLeft: string
  }
> = {
  trend: {
    label: "Trend Following",
    icon: "^",
    textColor: "text-sky-400",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/20",
    iconBg: "bg-sky-500/10",
    borderLeft: "border-l-sky-500",
  },
  "mean-reversion": {
    label: "Mean Reversion",
    icon: "~",
    textColor: "text-violet-400",
    badgeBg: "bg-violet-500/10",
    badgeBorder: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
    borderLeft: "border-l-violet-500",
  },
  "market-making": {
    label: "Market Making",
    icon: "=",
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    borderLeft: "border-l-amber-500",
  },
  statistical: {
    label: "Statistical",
    icon: "S",
    textColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    borderLeft: "border-l-emerald-500",
  },
  arbitrage: {
    label: "Arbitrage",
    icon: "A",
    textColor: "text-rose-400",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/20",
    iconBg: "bg-rose-500/10",
    borderLeft: "border-l-rose-500",
  },
}

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

const HORIZON_STYLES: Record<
  ProfitHorizon,
  {
    label: string
    sublabel: string
    bgColor: string
    textColor: string
    borderColor: string
  }
> = {
  "quick-gains": {
    label: "QUICK GAINS",
    sublabel: "Minutes to Hours",
    bgColor: "bg-red-500/15",
    textColor: "text-red-500",
    borderColor: "border-red-500/30",
  },
  "short-term": {
    label: "SHORT TERM",
    sublabel: "Hours to Days",
    bgColor: "bg-amber-500/15",
    textColor: "text-amber-500",
    borderColor: "border-amber-500/30",
  },
  "medium-term": {
    label: "MEDIUM TERM",
    sublabel: "Days to Weeks",
    bgColor: "bg-blue-500/15",
    textColor: "text-blue-500",
    borderColor: "border-blue-500/30",
  },
  "long-term": {
    label: "LONG TERM",
    sublabel: "Weeks to Months",
    bgColor: "bg-indigo-500/15",
    textColor: "text-indigo-500",
    borderColor: "border-indigo-500/30",
  },
  "steady-income": {
    label: "STEADY INCOME",
    sublabel: "Ongoing Returns",
    bgColor: "bg-emerald-500/15",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
  },
}

interface StrategyCardProps {
  strategy: StrategyDefinition
  isRunning: boolean
  selectedPair: string
}

export function StrategyCard({
  strategy,
  isRunning: initiallyRunning,
  selectedPair,
}: StrategyCardProps) {
  const [isRunning, setIsRunning] = useState(initiallyRunning)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const cat = CATEGORY_STYLES[strategy.category] ?? CATEGORY_STYLES.statistical
  const risk = RISK_STYLES[strategy.riskLevel]
  const horizon = HORIZON_STYLES[strategy.profitHorizon]
  const paramEntries = Object.entries(strategy.params)

  async function handleStart() {
    setIsLoading(true)
    setError("")
    try {
      // First, ensure a strategy instance exists via v2 POST /strategies
      const instanceName = `${strategy.id}-${selectedPair.toLowerCase()}`
      try {
        await api.createStrategy({
          name: instanceName,
          strategy_type: strategy.id,
          symbol: selectedPair,
          timeframe: strategy.defaultTimeframe,
          leverage: 3,
        })
      } catch {
        // Instance may already exist -- that's fine
      }
      await api.startStrategyV2(instanceName)
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
      const instanceName = `${strategy.id}-${selectedPair.toLowerCase()}`
      await api.stopStrategyV2(instanceName)
      setIsRunning(false)
    } catch {
      setError("Failed to stop strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const tierBadge = (
    <span className="ml-auto rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none text-muted-foreground">
      {strategy.tier}
    </span>
  )

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
            {tierBadge}
          </div>

          {isRunning ? (
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
              Ready
            </Badge>
          )}
        </div>

        <div className="mt-2">
          <h3 className="text-base font-bold tracking-tight">
            {strategy.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {strategy.plainDescription}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Profit Horizon + Return Speed - BIG & BOLD */}
        <div
          className={`rounded-lg border p-3 ${horizon.bgColor} ${horizon.borderColor}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p
                className={`text-lg font-extrabold tracking-tight ${horizon.textColor}`}
              >
                {horizon.label}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {horizon.sublabel}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Profit
                </span>
                <div className="flex gap-0.5">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <div
                      key={n}
                      className={`h-2.5 w-2.5 rounded-full ${
                        n <= strategy.maxProfitRating
                          ? "bg-yellow-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Speed
                </span>
                <div className="flex gap-0.5">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <div
                      key={n}
                      className={`h-2.5 w-2.5 rounded-full ${
                        n <= strategy.returnSpeed ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Parameters
            </p>
            <span className="text-[10px] text-muted-foreground">
              {strategy.defaultSymbol} / {strategy.defaultTimeframe}
            </span>
          </div>
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

        <div className="flex items-center justify-between rounded-md border bg-muted/10 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risk Level
          </span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {([1, 2, 3] as const).map((bar) => (
                <div
                  key={bar}
                  className={`h-4 w-2 rounded-sm ${
                    bar <= risk.bars ? risk.barColor : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-bold ${risk.textColor}`}>
              {risk.label}
            </span>
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
            onClick={handleStart}
            disabled={isLoading || isRunning}
          >
            {isLoading && !isRunning ? "Starting..." : "Start"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 gap-1.5 text-xs"
            onClick={handleStop}
            disabled={isLoading || !isRunning}
          >
            {isLoading && isRunning ? "Stopping..." : "Stop"}
          </Button>
        </div>

        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
