"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  Pause,
  Play,
  RefreshCw,
  Settings2,
  Shield,
  Signal,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import type { StrategyInstance, Trade } from "@/lib/api-client"

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

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

interface MetricBoxProps {
  label: string
  value: string
  icon: React.ElementType
  valueColor?: string
}

function MetricBox({ label, value, icon: Icon, valueColor }: MetricBoxProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={cn("mt-1 text-xl font-bold font-data", valueColor)}>
        {value}
      </p>
    </div>
  )
}

export function StrategyDetail() {
  const params = useParams()
  const strategyId = params.id as string
  const lang = params.lang as string

  const [instance, setInstance] = useState<StrategyInstance | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [allInstances, allTrades] = await Promise.all([
        api.getStrategies().catch(() => []),
        api.getTrades(50).catch(() => []),
      ])

      // Find matching instance
      const matched = allInstances.find(
        (i) => i.strategy_type === strategyId || i.name.startsWith(strategyId)
      )
      setInstance(matched ?? null)

      // Filter trades for this strategy
      const stratTrades = allTrades.filter(
        (t) => t.strategy === strategyId || t.strategy?.startsWith(strategyId)
      )
      setTrades(stratTrades)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleToggle = async () => {
    if (!instance) return
    setToggling(true)
    try {
      if (instance.status === "running") {
        await api.stopStrategyV2(instance.name)
      } else {
        await api.startStrategyV2(instance.name)
      }
      await fetchData()
    } catch {
      // silent
    } finally {
      setToggling(false)
    }
  }

  // Derived metrics
  const isRunning = instance?.status === "running"
  const totalPnl = instance?.total_pnl ?? 0
  const totalTrades = instance?.total_trades ?? 0
  const winRate =
    totalTrades > 0
      ? ((instance!.winning_trades / totalTrades) * 100).toFixed(1)
      : "0.0"
  const maxDrawdown = instance?.max_drawdown ?? 0
  const iterations = instance?.iterations ?? 0
  const errors = instance?.errors ?? 0
  const lastSignal = instance?.last_signal ?? "--"
  const lastSignalTime = instance?.last_signal_time ?? null

  // Generate PnL curve data from trades
  const pnlCurve = trades.reduce<{ idx: number; pnl: number }[]>(
    (acc, trade, i) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].pnl : 0
      acc.push({ idx: i + 1, pnl: prev + (trade.pnl ?? 0) })
      return acc
    },
    [{ idx: 0, pnl: 0 }]
  )

  const displayName = strategyId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${lang}/dashboards/strategy`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            {isRunning ? (
              <Badge className="gap-1.5 border-success/20 bg-success/10 text-success">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                Running
              </Badge>
            ) : instance ? (
              <Badge variant="outline" className="text-muted-foreground">
                Stopped
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Not deployed
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {instance
              ? `${instance.symbol} / ${instance.timeframe} | Leverage: ${instance.leverage}x`
              : "Deploy this strategy to see performance data."}
          </p>
        </div>
        {instance && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={cn("size-3.5", loading && "animate-spin")}
              />
            </Button>
            <Button
              size="sm"
              className={cn(
                "gap-1.5",
                isRunning
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                  : "bg-primary text-primary-foreground"
              )}
              onClick={handleToggle}
              disabled={toggling}
            >
              {toggling ? (
                <Activity className="size-3.5 animate-spin" />
              ) : isRunning ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5" />
              )}
              {isRunning ? "Stop" : "Start"}
            </Button>
          </div>
        )}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricBox
          label="Total P&L"
          value={formatCurrency(totalPnl)}
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          valueColor={
            totalPnl > 0
              ? "text-success glow-profit"
              : totalPnl < 0
                ? "text-destructive glow-loss"
                : "text-muted-foreground"
          }
        />
        <MetricBox
          label="Win Rate"
          value={`${winRate}%`}
          icon={Target}
          valueColor={
            parseFloat(winRate) >= 50 ? "text-success" : "text-destructive"
          }
        />
        <MetricBox
          label="Total Trades"
          value={totalTrades.toString()}
          icon={BarChart3}
        />
        <MetricBox
          label="Max Drawdown"
          value={`${maxDrawdown.toFixed(2)}%`}
          icon={Shield}
          valueColor="text-destructive"
        />
        <MetricBox
          label="Iterations"
          value={iterations.toString()}
          icon={Activity}
        />
        <MetricBox
          label="Last Signal"
          value={lastSignal.toUpperCase()}
          icon={Signal}
          valueColor={
            lastSignal === "long"
              ? "text-success"
              : lastSignal === "short"
                ? "text-destructive"
                : undefined
          }
        />
      </div>

      {/* Chart + Parameters */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* PnL Chart */}
        <Card className="lg:col-span-2 overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Cumulative P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pnlCurve.length <= 1 ? (
              <div className="card-grid-bg flex h-[250px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <BarChart3 className="size-8 opacity-30" />
                <p className="text-sm">No trade data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={pnlCurve}>
                  <defs>
                    <linearGradient
                      id="pnlGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          totalPnl >= 0
                            ? "hsl(160, 84%, 39%)"
                            : "hsl(0, 90%, 55%)"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          totalPnl >= 0
                            ? "hsl(160, 84%, 39%)"
                            : "hsl(0, 90%, 55%)"
                        }
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
                    dataKey="idx"
                    stroke="hsl(215, 12%, 48%)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Trade #",
                      position: "insideBottom",
                      style: { fontSize: 10, fill: "hsl(215, 12%, 48%)" },
                    }}
                  />
                  <YAxis
                    stroke="hsl(215, 12%, 48%)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v.toFixed(0)}`}
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
                      "Cumulative P&L",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke={
                      totalPnl >= 0 ? "hsl(160, 84%, 39%)" : "hsl(0, 90%, 55%)"
                    }
                    strokeWidth={2}
                    fill="url(#pnlGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Parameters panel */}
        <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Settings2 className="size-4" />
              Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {instance ? (
              <>
                <div className="space-y-2">
                  {Object.entries(instance.params ?? {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2 rounded-md border bg-muted/10 px-3 py-2"
                    >
                      <span className="text-xs text-muted-foreground">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="font-data text-sm font-semibold">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Additional info */}
                <div className="space-y-1.5 border-t pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Leverage</span>
                    <span className="font-data font-semibold">
                      {instance.leverage}x
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Size (USD)</span>
                    <span className="font-data font-semibold">
                      ${instance.size_usd}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Errors</span>
                    <span
                      className={cn(
                        "font-data font-semibold",
                        errors > 0 && "text-destructive"
                      )}
                    >
                      {errors}
                    </span>
                  </div>
                  {lastSignalTime && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Last Signal At
                      </span>
                      <span className="font-data text-[11px]">
                        {formatTime(lastSignalTime)}
                      </span>
                    </div>
                  )}
                  {instance.error_message && (
                    <div className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 p-2">
                      <p className="text-[11px] text-destructive">
                        {instance.error_message}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="card-grid-bg flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                <Settings2 className="size-8 opacity-30" />
                <p className="text-sm">No instance deployed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trade history table */}
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trade History
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {trades.length} trades
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {trades.length === 0 ? (
            <div className="card-grid-bg flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Clock className="size-8 opacity-30" />
              <p className="text-sm">No trades yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Symbol
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Side
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Size
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Entry
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Exit
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      P&L
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Reason
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow
                      key={trade.id}
                      className="border-border/20 transition-colors hover:bg-primary/[0.03]"
                    >
                      <TableCell className="font-semibold">
                        {trade.symbol}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold uppercase",
                            trade.side === "long" || trade.side === "buy"
                              ? "border-[hsl(185_100%_42%/0.3)] bg-[hsl(185_100%_42%/0.1)] text-[hsl(185_100%_42%)]"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          )}
                        >
                          {trade.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-data">
                        {trade.size}
                      </TableCell>
                      <TableCell className="text-right font-data text-muted-foreground">
                        ${trade.entry_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-data text-muted-foreground">
                        {trade.exit_price
                          ? `$${trade.exit_price.toLocaleString()}`
                          : "--"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-data font-semibold",
                            (trade.pnl ?? 0) > 0 && "text-success",
                            (trade.pnl ?? 0) < 0 && "text-destructive",
                            (trade.pnl ?? 0) === 0 && "text-muted-foreground"
                          )}
                        >
                          {trade.pnl !== null
                            ? `${trade.pnl > 0 ? "+" : ""}${formatCurrency(trade.pnl)}`
                            : "--"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {trade.exit_reason ?? (trade.is_open ? "Open" : "--")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {trade.opened_at ? formatTime(trade.opened_at) : "--"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
