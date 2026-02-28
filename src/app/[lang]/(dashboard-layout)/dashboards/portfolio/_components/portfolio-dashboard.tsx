"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  PieChart,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"

import type {
  DashboardStats,
  StrategyInstance,
  VaultStatus,
} from "@/lib/api-client"

import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

// Colors for the pie chart
const STRATEGY_COLORS = [
  "hsl(185, 100%, 42%)",
  "hsl(160, 84%, 39%)",
  "hsl(45, 100%, 55%)",
  "hsl(280, 70%, 55%)",
  "hsl(0, 90%, 55%)",
  "hsl(210, 100%, 55%)",
  "hsl(130, 70%, 45%)",
  "hsl(320, 80%, 55%)",
]

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: number
  variant?: "default" | "profit" | "loss"
  glow?: boolean
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  glow = false,
}: MetricCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)]">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px transition-opacity duration-300",
          variant === "profit" &&
            "bg-gradient-to-r from-transparent via-success to-transparent opacity-60",
          variant === "loss" &&
            "bg-gradient-to-r from-transparent via-destructive to-transparent opacity-60",
          variant === "default" &&
            "bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100"
        )}
      />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="size-4" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {title}
            </span>
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium font-data",
                trend >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {formatPct(trend)}
            </div>
          )}
        </div>
        <p
          className={cn(
            "mt-2 text-2xl font-bold tracking-tight font-data",
            variant === "profit" && glow && "text-success glow-profit",
            variant === "loss" && glow && "text-destructive glow-loss"
          )}
        >
          {value}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  )
}

export function PortfolioDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [vault, setVault] = useState<VaultStatus | null>(null)
  const [strategies, setStrategies] = useState<StrategyInstance[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [dashStats, vaultStatus, strats] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getVaultStatus().catch(() => null),
        api.getStrategies().catch(() => []),
      ])
      setStats(dashStats)
      setVault(vaultStatus)
      setStrategies(strats)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  // Derived calculations
  const runningStrategies = strategies.filter((s) => s.status === "running")
  const totalPnl = strategies.reduce((s, i) => s + (i.total_pnl ?? 0), 0)
  const totalTradeCount = strategies.reduce(
    (s, i) => s + (i.total_trades ?? 0),
    0
  )
  const totalWins = strategies.reduce((s, i) => s + (i.winning_trades ?? 0), 0)
  const overallWinRate =
    totalTradeCount > 0 ? ((totalWins / totalTradeCount) * 100).toFixed(1) : "0"
  const _maxDrawdown = Math.min(
    ...strategies.map((s) => s.max_drawdown ?? 0),
    0
  )
  const portfolioValue =
    vault?.live_equity ?? vault?.total_equity ?? stats?.vault_equity ?? 0

  // Strategy allocation data for pie chart
  const allocationData = runningStrategies
    .filter((s) => s.size_usd > 0)
    .map((s, i) => ({
      name: s.strategy_type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      value: s.size_usd,
      color: STRATEGY_COLORS[i % STRATEGY_COLORS.length],
    }))

  // Strategy performance table (sorted by PnL)
  const sortedStrategies = [...strategies].sort(
    (a, b) => (b.total_pnl ?? 0) - (a.total_pnl ?? 0)
  )

  // Mock equity curve data (would come from vault history endpoint)
  const equityCurve = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value:
      portfolioValue * (0.95 + 0.05 * Math.random()) +
      i * (portfolioValue * 0.002),
  }))

  return (
    <div className="space-y-5">
      {/* Hero metrics row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(portfolioValue)}
          icon={Wallet}
          variant="default"
        />
        <MetricCard
          title="Total P&L"
          value={formatCurrency(totalPnl)}
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          variant={totalPnl >= 0 ? "profit" : "loss"}
          glow
        />
        <MetricCard
          title="Win Rate"
          value={`${overallWinRate}%`}
          subtitle={`${totalWins} wins / ${totalTradeCount} total`}
          icon={Target}
        />
        <MetricCard
          title="Total Trades"
          value={totalTradeCount.toString()}
          icon={BarChart3}
        />
        <MetricCard
          title="Active Strategies"
          value={`${runningStrategies.length} / ${strategies.length}`}
          icon={Bot}
        />
      </div>

      {/* Main content: Chart + Pie */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Portfolio value chart */}
        <Card className="lg:col-span-2 overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Portfolio Value
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw
                  className={cn("size-3 mr-1", loading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient
                    id="portfolioGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(185, 100%, 42%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(185, 100%, 42%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 15%, 12%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(215, 12%, 48%)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(215, 12%, 48%)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(220, 18%, 6%)",
                    border: "1px solid hsl(220, 15%, 12%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Value",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(185, 100%, 42%)"
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Strategy allocation pie chart */}
        <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Strategy Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length === 0 ? (
              <div className="card-grid-bg flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                <PieChart className="size-8 opacity-30" />
                <p className="text-xs">No active allocations</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: "hsl(220, 18%, 6%)",
                        border: "1px solid hsl(220, 15%, 12%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Allocation",
                      ]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {allocationData.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate text-muted-foreground">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-data font-medium">
                        {formatCurrency(entry.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy performance table */}
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Strategy Performance
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {strategies.length} strategies
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {strategies.length === 0 ? (
            <div className="card-grid-bg flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Bot className="size-8 opacity-30" />
              <p className="text-sm">No strategies deployed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Strategy
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Symbol
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      P&L
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Win Rate
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Trades
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Drawdown
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStrategies.map((s) => {
                    const wr =
                      s.total_trades > 0
                        ? (s.winning_trades / s.total_trades) * 100
                        : 0
                    return (
                      <TableRow
                        key={s.id}
                        className="border-border/20 transition-colors hover:bg-primary/[0.03]"
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">
                              {s.strategy_type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {s.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {s.status === "running" ? (
                            <Badge className="gap-1 border-success/20 bg-success/10 text-[10px] text-success">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                              </span>
                              Running
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-muted-foreground"
                            >
                              Stopped
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-data text-sm">
                          {s.symbol}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-data font-semibold",
                              s.total_pnl > 0 && "text-success",
                              s.total_pnl < 0 && "text-destructive",
                              s.total_pnl === 0 && "text-muted-foreground"
                            )}
                          >
                            {s.total_pnl > 0 ? "+" : ""}
                            {formatCurrency(s.total_pnl)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-data",
                              wr >= 50 ? "text-success" : "text-destructive"
                            )}
                          >
                            {wr.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-data">
                          {s.total_trades}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-data text-destructive">
                            {(s.max_drawdown ?? 0).toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
