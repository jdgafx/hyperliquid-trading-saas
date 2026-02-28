"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowDownAZ,
  ArrowUpDown,
  Bot,
  Grid3X3,
  LayoutList,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trophy,
} from "lucide-react"

import type { StrategyInstance } from "@/lib/api-client"
import type {
  StrategyCategory,
  StrategyDefinition,
  StrategyTier,
} from "../_data/strategy"

import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { StrategyCard } from "./strategy-card"
import { TradingPairSelector } from "./trading-pair-selector"

const TIER_LABELS: Record<
  StrategyTier,
  { label: string; color: string; badge: string }
> = {
  A: {
    label: "Tier A - HL Native",
    color: "text-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  B: {
    label: "Tier B - Bonus",
    color: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  C: {
    label: "Tier C - Bootcamp",
    color: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-muted-foreground/20",
  },
  D: {
    label: "Tier D - Backtested",
    color: "text-violet-400",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
}

const CATEGORY_LABELS: Record<StrategyCategory, string> = {
  trend: "Trend Following",
  "mean-reversion": "Mean Reversion",
  "market-making": "Market Making",
  statistical: "Statistical",
  arbitrage: "Arbitrage",
}

type SortKey = "name" | "pnl" | "winRate" | "trades" | "risk" | "tier"
type ViewMode = "grid" | "compact"

interface StrategyLayoutProps {
  strategies: StrategyDefinition[]
  runningInstances: StrategyInstance[]
}

export function StrategyLayout({
  strategies,
  runningInstances: initialInstances,
}: StrategyLayoutProps) {
  const [selectedPair, setSelectedPair] = useState("BTC")
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterRisk, setFilterRisk] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("tier")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [liveInstances, setLiveInstances] = useState<StrategyInstance[]>(initialInstances)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Auto-refresh strategy instances every 10 seconds
  const refreshInstances = useCallback(async () => {
    try {
      const instances = await api.getStrategies()
      setLiveInstances(instances)
      setLastRefresh(new Date())
    } catch {
      // Silently fail — keep last known data
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(refreshInstances, 10_000)
    return () => clearInterval(interval)
  }, [refreshInstances])

  const runningInstances = liveInstances

  // Build maps for quick lookup
  const instanceMap = useMemo(() => {
    const map = new Map<string, StrategyInstance>()
    for (const inst of runningInstances) {
      map.set(inst.strategy_type, inst)
    }
    return map
  }, [runningInstances])

  const runningTypes = useMemo(
    () =>
      new Set(
        runningInstances
          .filter((i) => i.status === "running")
          .map((i) => i.strategy_type)
      ),
    [runningInstances]
  )

  // Derived stats
  const totalRunning = runningTypes.size
  const totalPnl = runningInstances.reduce((s, i) => s + (i.total_pnl ?? 0), 0)
  const totalTrades = runningInstances.reduce(
    (s, i) => s + (i.total_trades ?? 0),
    0
  )

  // Filter and sort
  const filtered = useMemo(() => {
    const result = strategies.filter((s) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.id.toLowerCase().includes(q) &&
          !s.plainDescription.toLowerCase().includes(q) &&
          !s.category.toLowerCase().includes(q)
        )
          return false
      }
      if (filterTier !== "all" && s.tier !== filterTier) return false
      if (filterCategory !== "all" && s.category !== filterCategory)
        return false
      if (filterRisk !== "all" && s.riskLevel !== filterRisk) return false
      if (filterStatus === "running" && !runningTypes.has(s.id)) return false
      if (filterStatus === "stopped" && runningTypes.has(s.id)) return false
      return true
    })

    // Sort
    const riskOrder = { low: 0, medium: 1, high: 2 }
    const tierOrder = { A: 0, B: 1, C: 2, D: 3 }

    result.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name)
        case "pnl": {
          const aPnl = instanceMap.get(a.id)?.total_pnl ?? 0
          const bPnl = instanceMap.get(b.id)?.total_pnl ?? 0
          return bPnl - aPnl
        }
        case "winRate": {
          const aInst = instanceMap.get(a.id)
          const bInst = instanceMap.get(b.id)
          const aWr =
            aInst && aInst.total_trades > 0
              ? aInst.winning_trades / aInst.total_trades
              : -1
          const bWr =
            bInst && bInst.total_trades > 0
              ? bInst.winning_trades / bInst.total_trades
              : -1
          return bWr - aWr
        }
        case "trades": {
          const aT = instanceMap.get(a.id)?.total_trades ?? 0
          const bT = instanceMap.get(b.id)?.total_trades ?? 0
          return bT - aT
        }
        case "risk":
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        case "tier":
        default:
          return tierOrder[a.tier] - tierOrder[b.tier]
      }
    })

    return result
  }, [
    strategies,
    search,
    filterTier,
    filterCategory,
    filterRisk,
    filterStatus,
    sortKey,
    runningTypes,
    instanceMap,
  ])

  // Group by tier for tier view
  const groupedByTier = useMemo(() => {
    if (sortKey !== "tier") return null
    const groups: Record<StrategyTier, StrategyDefinition[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
    }
    for (const s of filtered) {
      groups[s.tier].push(s)
    }
    return groups
  }, [filtered, sortKey])

  return (
    <div className="flex flex-col gap-5">
      {/* Quick stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Strategies
            </p>
            <p className="text-lg font-bold font-data">{strategies.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Running
            </p>
            <p className="text-lg font-bold font-data text-success">
              {totalRunning}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              totalPnl >= 0 ? "bg-success/10" : "bg-destructive/10"
            )}
          >
            <Trophy
              className={cn(
                "size-4",
                totalPnl >= 0 ? "text-success" : "text-destructive"
              )}
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total P&L
            </p>
            <p
              className={cn(
                "text-lg font-bold font-data",
                totalPnl > 0 && "text-success glow-profit",
                totalPnl < 0 && "text-destructive glow-loss",
                totalPnl === 0 && "text-muted-foreground"
              )}
            >
              {totalPnl === 0
                ? "$0.00"
                : `${totalPnl > 0 ? "+" : ""}$${Math.abs(totalPnl).toFixed(2)}`}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-3/10">
            <ArrowUpDown className="size-4 text-chart-3" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Trades
            </p>
            <p className="text-lg font-bold font-data">{totalTrades}</p>
          </div>
        </Card>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col gap-3">
        {/* Search + Pair + View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search strategies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-card/80 text-sm"
            />
          </div>

          <TradingPairSelector
            selectedPair={selectedPair}
            onPairChange={setSelectedPair}
          />

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as ViewMode)}
            className="hidden md:flex"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Grid view"
              className="h-9 w-9 p-0"
            >
              <Grid3X3 className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="compact"
              aria-label="Compact view"
              className="h-9 w-9 p-0"
            >
              <LayoutList className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />

          {/* Tier filter */}
          <Select value={filterTier} onValueChange={setFilterTier}>
            <SelectTrigger className="h-8 w-[120px] text-xs bg-card/80">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="A">Tier A</SelectItem>
              <SelectItem value="B">Tier B</SelectItem>
              <SelectItem value="C">Tier C</SelectItem>
              <SelectItem value="D">Tier D</SelectItem>
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-card/80">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Risk filter */}
          <Select value={filterRisk} onValueChange={setFilterRisk}>
            <SelectTrigger className="h-8 w-[110px] text-xs bg-card/80">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-[110px] text-xs bg-card/80">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border/50 mx-1" />

          {/* Sort */}
          <Select
            value={sortKey}
            onValueChange={(v) => setSortKey(v as SortKey)}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs bg-card/80">
              <ArrowDownAZ className="size-3 mr-1" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tier">By Tier</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="pnl">By P&L</SelectItem>
              <SelectItem value="winRate">By Win Rate</SelectItem>
              <SelectItem value="trades">By Trades</SelectItem>
              <SelectItem value="risk">By Risk</SelectItem>
            </SelectContent>
          </Select>

          {/* Results count + live refresh */}
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <button onClick={refreshInstances} className="flex items-center gap-1 hover:text-foreground transition-colors" title="Refresh data">
              <RefreshCw className="size-3" />
              <span className="hidden sm:inline">{lastRefresh.toLocaleTimeString()}</span>
            </button>
            <span>{filtered.length} of {strategies.length}</span>
          </span>
        </div>
      </div>

      {/* Grid content */}
      {filtered.length === 0 ? (
        <Card className="card-grid-bg flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Bot className="size-10 opacity-20" />
          <p className="text-sm">No strategies match your filters</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              setSearch("")
              setFilterTier("all")
              setFilterCategory("all")
              setFilterRisk("all")
              setFilterStatus("all")
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : sortKey === "tier" && groupedByTier ? (
        // Grouped by tier
        (["A", "B", "C", "D"] as StrategyTier[]).map((tier) => {
          const tierStrategies = groupedByTier[tier]
          if (!tierStrategies || tierStrategies.length === 0) return null
          const tierMeta = TIER_LABELS[tier]

          return (
            <div key={tier} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    tierMeta.color
                  )}
                >
                  {tierMeta.label}
                </h3>
                <Badge
                  variant="outline"
                  className={cn("h-5 text-[10px]", tierMeta.badge)}
                >
                  {tierStrategies.length}
                </Badge>
              </div>
              <div
                className={cn(
                  "grid gap-4",
                  viewMode === "grid"
                    ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2"
                )}
              >
                {tierStrategies.map((strategy) => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    isRunning={runningTypes.has(strategy.id)}
                    selectedPair={selectedPair}
                    instance={instanceMap.get(strategy.id) ?? null}
                    compact={viewMode === "compact"}
                  />
                ))}
              </div>
            </div>
          )
        })
      ) : (
        // Flat list (sorted by something other than tier)
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 md:grid-cols-2"
          )}
        >
          {filtered.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isRunning={runningTypes.has(strategy.id)}
              selectedPair={selectedPair}
              instance={instanceMap.get(strategy.id) ?? null}
              compact={viewMode === "compact"}
            />
          ))}
        </div>
      )}
    </div>
  )
}
