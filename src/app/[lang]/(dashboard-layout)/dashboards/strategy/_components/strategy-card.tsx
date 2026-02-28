"use client"

import { useState } from "react"
import { Activity, Pause, Play, Zap } from "lucide-react"

import type { StrategyInstance } from "@/lib/api-client"
import type {
  ProfitHorizon,
  StrategyCategory,
  StrategyDefinition,
} from "../_data/strategy"

import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
    gradient: string
  }
> = {
  trend: {
    label: "Trend",
    icon: "^",
    textColor: "text-primary",
    badgeBg: "bg-primary/10",
    badgeBorder: "border-primary/20",
    iconBg: "bg-primary/10",
    borderLeft: "border-l-primary",
    gradient: "from-primary/5 to-transparent",
  },
  "mean-reversion": {
    label: "Mean Rev",
    icon: "~",
    textColor: "text-violet-400",
    badgeBg: "bg-violet-500/10",
    badgeBorder: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
    borderLeft: "border-l-violet-500",
    gradient: "from-violet-500/5 to-transparent",
  },
  "market-making": {
    label: "MM",
    icon: "=",
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    borderLeft: "border-l-amber-500",
    gradient: "from-amber-500/5 to-transparent",
  },
  statistical: {
    label: "Stats",
    icon: "S",
    textColor: "text-success",
    badgeBg: "bg-success/10",
    badgeBorder: "border-success/20",
    iconBg: "bg-success/10",
    borderLeft: "border-l-success",
    gradient: "from-success/5 to-transparent",
  },
  arbitrage: {
    label: "Arb",
    icon: "A",
    textColor: "text-rose-400",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/20",
    iconBg: "bg-rose-500/10",
    borderLeft: "border-l-rose-500",
    gradient: "from-rose-500/5 to-transparent",
  },
}

const RISK_STYLES = {
  low: {
    label: "Low",
    bars: 1,
    barColor: "bg-success",
    textColor: "text-success",
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
    barColor: "bg-destructive",
    textColor: "text-destructive",
  },
} as const

const HORIZON_SHORT: Record<ProfitHorizon, string> = {
  "quick-gains": "Min-Hrs",
  "short-term": "Hrs-Days",
  "medium-term": "Days-Wks",
  "long-term": "Wks-Mos",
  "steady-income": "Ongoing",
}

interface StrategyCardProps {
  strategy: StrategyDefinition
  isRunning: boolean
  selectedPair: string
  instance?: StrategyInstance | null
  onToggle?: (id: string, running: boolean) => void
  compact?: boolean
}

export function StrategyCard({
  strategy,
  isRunning: initiallyRunning,
  selectedPair,
  instance,
  onToggle,
  compact: _compact = false,
}: StrategyCardProps) {
  const [isRunning, setIsRunning] = useState(initiallyRunning)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const cat = CATEGORY_STYLES[strategy.category] ?? CATEGORY_STYLES.statistical
  const risk = RISK_STYLES[strategy.riskLevel] ?? RISK_STYLES.medium

  // Performance data from instance
  const pnl = instance?.total_pnl ?? 0
  const winRate =
    instance && instance.total_trades > 0
      ? ((instance.winning_trades / instance.total_trades) * 100).toFixed(1)
      : null
  const totalTrades = instance?.total_trades ?? 0
  const isProfitable = pnl > 0
  const isLoss = pnl < 0

  async function handleToggle() {
    setIsLoading(true)
    setError("")
    try {
      const instanceName = `${strategy.id}-${selectedPair.toLowerCase()}`
      if (isRunning) {
        await api.stopStrategyV2(instanceName)
        setIsRunning(false)
        onToggle?.(strategy.id, false)
      } else {
        try {
          await api.createStrategy({
            name: instanceName,
            strategy_type: strategy.id,
            symbol: selectedPair,
            timeframe: strategy.defaultTimeframe,
            leverage: 3,
          })
        } catch {
          // Instance may already exist
        }
        await api.startStrategyV2(instanceName)
        setIsRunning(true)
        onToggle?.(strategy.id, true)
      }
    } catch {
      setError(isRunning ? "Failed to stop" : "Failed to start")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "group relative flex flex-col overflow-hidden border-l-2 transition-all duration-300",
          cat.borderLeft,
          "hover:shadow-lg hover:shadow-black/5",
          isRunning && "border-l-success ring-1 ring-success/10",
          isProfitable && isRunning && "ring-success/20",
          isLoss && isRunning && "ring-destructive/10"
        )}
      >
        {/* Subtle gradient bg based on category */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            cat.gradient
          )}
        />

        <CardHeader className="relative pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Category icon */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                  cat.iconBg,
                  cat.textColor
                )}
              >
                {cat.icon}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold tracking-tight">
                  {strategy.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-4 px-1 text-[9px] font-semibold uppercase tracking-wider",
                      cat.textColor,
                      cat.badgeBg,
                      cat.badgeBorder
                    )}
                  >
                    {cat.label}
                  </Badge>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {strategy.defaultSymbol}/{strategy.defaultTimeframe}
                  </span>
                </div>
              </div>
            </div>

            {/* Tier + Status */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none text-muted-foreground">
                    {strategy.tier}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Tier {strategy.tier}
                </TooltipContent>
              </Tooltip>

              {isRunning ? (
                <Badge className="h-5 gap-1 border-success/20 bg-success/10 px-1.5 text-[10px] text-success">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  Live
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-muted-foreground/20 px-1.5 text-[10px] text-muted-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  Off
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative flex flex-1 flex-col gap-3 px-4 pb-4 pt-0">
          {/* Description */}
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {strategy.plainDescription}
          </p>

          {/* PnL / Stats Row */}
          <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/20 p-2.5">
            {/* PnL */}
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                P&L
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-bold font-data",
                  isProfitable && "text-success glow-profit",
                  isLoss && "text-destructive glow-loss",
                  !isProfitable && !isLoss && "text-muted-foreground"
                )}
              >
                {pnl === 0 ? (
                  "--"
                ) : (
                  <>
                    {isProfitable ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                  </>
                )}
              </p>
            </div>
            {/* Win Rate */}
            <div className="text-center border-x border-border/40">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Win Rate
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-bold font-data",
                  winRate && parseFloat(winRate) >= 50
                    ? "text-success"
                    : winRate
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                {winRate ? `${winRate}%` : "--"}
              </p>
            </div>
            {/* Trades */}
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Trades
              </p>
              <p className="mt-0.5 text-sm font-bold font-data text-foreground">
                {totalTrades || "--"}
              </p>
            </div>
          </div>

          {/* Indicators Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Risk level */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {([1, 2, 3] as const).map((bar) => (
                  <div
                    key={bar}
                    className={cn(
                      "h-3 w-1.5 rounded-[2px]",
                      bar <= risk.bars ? risk.barColor : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className={cn("text-[10px] font-semibold", risk.textColor)}>
                {risk.label}
              </span>
            </div>

            {/* Profit rating dots */}
            <div className="flex items-center gap-1">
              <Zap className="size-3 text-amber-400" />
              <div className="flex gap-0.5">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <div
                    key={n}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      n <= strategy.maxProfitRating
                        ? "bg-amber-400"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Return speed */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-muted-foreground">
                  {HORIZON_SHORT[strategy.profitHorizon]}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {strategy.profitHorizon.replace("-", " ")}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Action buttons */}
          <div className="mt-auto flex gap-2 pt-1">
            <Button
              size="sm"
              className={cn(
                "flex-1 gap-1.5 text-xs font-semibold transition-all duration-200",
                isRunning
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              onClick={handleToggle}
              disabled={isLoading}
            >
              {isLoading ? (
                <Activity className="size-3 animate-spin" />
              ) : isRunning ? (
                <Pause className="size-3" />
              ) : (
                <Play className="size-3" />
              )}
              {isLoading
                ? isRunning
                  ? "Stopping..."
                  : "Starting..."
                : isRunning
                  ? "Stop"
                  : "Start"}
            </Button>
          </div>

          {error && (
            <p className="text-center text-[10px] text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
