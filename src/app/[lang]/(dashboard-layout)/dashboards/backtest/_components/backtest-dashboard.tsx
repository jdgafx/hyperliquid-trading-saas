"use client"

import { useCallback, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : "http://localhost:8000"

const SYMBOLS = ["BTC", "ETH", "SOL", "ARB", "DOGE", "MATIC", "AVAX", "LINK"]
const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"]

// ---------- Types ----------

interface EquityPoint {
  date: string
  equity: number
}

interface TradeRecord {
  id: number
  symbol: string
  side: string
  entry_price: number
  exit_price: number
  pnl: number
  opened_at: string
  closed_at: string
}

interface BacktestResult {
  return_pct: number
  sharpe_ratio: number
  sortino_ratio: number
  calmar_ratio: number
  max_drawdown_pct: number
  profit_factor: number
  win_rate: number
  total_trades: number
  equity_curve: EquityPoint[]
  trades: TradeRecord[]
}

interface BacktestSummary {
  id: string
  strategy_type: string
  symbol: string
  timeframe: string
  return_pct: number
  sharpe_ratio: number
  max_drawdown_pct: number
  total_trades: number
  created_at: string
}

interface BacktestDashboardProps {
  strategies: string[]
  initialHistory: BacktestSummary[]
}

// ---------- Helpers ----------

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
}

function formatNumber(v: number, decimals = 2): string {
  return v.toFixed(decimals)
}

function formatCurrency(v: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(v)
}

function pnlColor(v: number): string {
  if (v > 0) return "text-emerald-400"
  if (v < 0) return "text-red-400"
  return "text-muted-foreground"
}

// ---------- Component ----------

export function BacktestDashboard({
  strategies,
  initialHistory,
}: BacktestDashboardProps) {
  // Form state
  const [strategyType, setStrategyType] = useState(strategies[0] ?? "turtle")
  const [symbol, setSymbol] = useState("BTC")
  const [timeframe, setTimeframe] = useState("1h")
  const [lookbackDays, setLookbackDays] = useState("90")
  const [initialCapital, setInitialCapital] = useState("10000")
  const [commission, setCommission] = useState("0.07")

  // Execution state
  const [isRunning, setIsRunning] = useState(false)
  const [isMultiRunning, setIsMultiRunning] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [multiResults, setMultiResults] = useState<BacktestSummary[]>([])
  const [history, setHistory] = useState<BacktestSummary[]>(initialHistory)

  const runBacktest = useCallback(async () => {
    setIsRunning(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/backtest/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_type: strategyType,
          symbol,
          timeframe,
          lookback_days: parseInt(lookbackDays),
          initial_capital: parseFloat(initialCapital),
          commission_pct: parseFloat(commission),
        }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `HTTP ${res.status}`)
      }
      const data: BacktestResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed")
    } finally {
      setIsRunning(false)
    }
  }, [
    strategyType,
    symbol,
    timeframe,
    lookbackDays,
    initialCapital,
    commission,
  ])

  const runMultiTest = useCallback(async () => {
    setIsMultiRunning(true)
    setError("")
    setMultiResults([])
    try {
      const res = await fetch(`${API_URL}/backtest/multi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_type: strategyType,
          lookback_days: parseInt(lookbackDays),
          initial_capital: parseFloat(initialCapital),
          commission_pct: parseFloat(commission),
        }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `HTTP ${res.status}`)
      }
      const data: BacktestSummary[] = await res.json()
      setMultiResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Multi-test failed")
    } finally {
      setIsMultiRunning(false)
    }
  }, [strategyType, lookbackDays, initialCapital, commission])

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/backtest/history`)
      if (res.ok) {
        const data: BacktestSummary[] = await res.json()
        setHistory(data)
      }
    } catch {
      // silent
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Config Form ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Backtest Configuration</CardTitle>
          <CardDescription>
            Configure parameters then run a single or multi-symbol/timeframe
            backtest.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-2">
              <Label>Strategy</Label>
              <Select value={strategyType} onValueChange={setStrategyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYMBOLS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lookback">Lookback (days)</Label>
              <Input
                id="lookback"
                type="number"
                min="7"
                max="365"
                value={lookbackDays}
                onChange={(e) => setLookbackDays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">Initial Capital ($)</Label>
              <Input
                id="capital"
                type="number"
                min="100"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission %</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                step="0.01"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={runBacktest}
              disabled={isRunning || isMultiRunning}
            >
              {isRunning ? "Running..." : "Run Backtest"}
            </Button>
            <Button
              variant="secondary"
              onClick={runMultiTest}
              disabled={isRunning || isMultiRunning}
            >
              {isMultiRunning ? "Testing..." : "Run Multi-Test"}
            </Button>
            <Button variant="outline" onClick={refreshHistory}>
              Refresh History
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* ---------- Results ---------- */}
      {result && (
        <div className="flex flex-col gap-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Return",
                value: formatPct(result.return_pct),
                color: pnlColor(result.return_pct),
              },
              {
                label: "Sharpe Ratio",
                value: formatNumber(result.sharpe_ratio),
                color:
                  result.sharpe_ratio >= 1
                    ? "text-emerald-400"
                    : "text-amber-400",
              },
              {
                label: "Sortino Ratio",
                value: formatNumber(result.sortino_ratio),
                color:
                  result.sortino_ratio >= 1
                    ? "text-emerald-400"
                    : "text-amber-400",
              },
              {
                label: "Calmar Ratio",
                value: formatNumber(result.calmar_ratio),
                color:
                  result.calmar_ratio >= 1
                    ? "text-emerald-400"
                    : "text-amber-400",
              },
              {
                label: "Max Drawdown",
                value: formatPct(-Math.abs(result.max_drawdown_pct)),
                color: "text-red-400",
              },
              {
                label: "Profit Factor",
                value: formatNumber(result.profit_factor),
                color:
                  result.profit_factor >= 1
                    ? "text-emerald-400"
                    : "text-red-400",
              },
              {
                label: "Win Rate",
                value: formatPct(result.win_rate),
                color:
                  result.win_rate >= 50 ? "text-emerald-400" : "text-amber-400",
              },
              {
                label: "Total Trades",
                value: result.total_trades.toString(),
                color: "text-foreground",
              },
            ].map((m) => (
              <Card key={m.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={`text-2xl font-bold tabular-nums ${m.color}`}>
                    {m.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Equity Curve */}
          {result.equity_curve.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Equity Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={result.equity_curve}
                      margin={{ left: 8, right: 8, top: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                        tickFormatter={(v: string) =>
                          new Date(v).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        minTickGap={40}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={72}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                        tickFormatter={(v: number) =>
                          `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelFormatter={(label: string) =>
                          new Date(label).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Equity",
                        ]}
                      />
                      <Line
                        dataKey="equity"
                        type="monotone"
                        stroke={
                          result.return_pct >= 0
                            ? "hsl(142, 71%, 45%)"
                            : "hsl(0, 72%, 51%)"
                        }
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trades Table */}
          {result.trades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Trades</CardTitle>
                <CardDescription>
                  {result.trades.length} trades executed during backtest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right">Entry</TableHead>
                        <TableHead className="text-right">Exit</TableHead>
                        <TableHead className="text-right">P&L</TableHead>
                        <TableHead>Opened</TableHead>
                        <TableHead>Closed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.trades.map((t, i) => (
                        <TableRow key={t.id ?? i}>
                          <TableCell className="tabular-nums">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-medium">
                            {t.symbol}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                t.side === "long" ? "default" : "destructive"
                              }
                              className="text-[10px]"
                            >
                              {t.side.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(t.entry_price)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(t.exit_price)}
                          </TableCell>
                          <TableCell
                            className={`text-right tabular-nums font-medium ${pnlColor(t.pnl)}`}
                          >
                            {formatCurrency(t.pnl)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {t.opened_at
                              ? new Date(t.opened_at).toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {t.closed_at
                              ? new Date(t.closed_at).toLocaleString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ---------- Multi-Test Results ---------- */}
      {multiResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Multi-Test Results</CardTitle>
            <CardDescription>
              {multiResults.length} symbol/timeframe combinations tested for{" "}
              {strategyType.replace(/_/g, " ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Timeframe</TableHead>
                  <TableHead className="text-right">Return</TableHead>
                  <TableHead className="text-right">Sharpe</TableHead>
                  <TableHead className="text-right">Max DD</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {multiResults
                  .sort((a, b) => b.sharpe_ratio - a.sharpe_ratio)
                  .map((r, i) => (
                    <TableRow key={`${r.symbol}-${r.timeframe}-${i}`}>
                      <TableCell className="font-medium">{r.symbol}</TableCell>
                      <TableCell>{r.timeframe}</TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${pnlColor(r.return_pct)}`}
                      >
                        {formatPct(r.return_pct)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(r.sharpe_ratio)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-red-400">
                        {formatPct(-Math.abs(r.max_drawdown_pct))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.total_trades}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ---------- History ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Backtest History</CardTitle>
          <CardDescription>
            {history.length > 0
              ? `${history.length} past backtest runs`
              : "No past backtests. Run one above to get started."}
          </CardDescription>
        </CardHeader>
        {history.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>TF</TableHead>
                  <TableHead className="text-right">Return</TableHead>
                  <TableHead className="text-right">Sharpe</TableHead>
                  <TableHead className="text-right">Max DD</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">
                      {h.strategy_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>{h.symbol}</TableCell>
                    <TableCell>{h.timeframe}</TableCell>
                    <TableCell
                      className={`text-right tabular-nums font-medium ${pnlColor(h.return_pct)}`}
                    >
                      {formatPct(h.return_pct)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(h.sharpe_ratio)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-red-400">
                      {formatPct(-Math.abs(h.max_drawdown_pct))}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {h.total_trades}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
