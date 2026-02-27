"use client"

import { useCallback, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

// ---------- Types ----------

interface RegimeInfo {
  symbol: string
  regime: string
  confidence: number
  duration_hours: number
  recommended_strategies: string[]
  avoid_strategies: string[]
}

interface VolatilityStatus {
  symbol: string
  atr_14: number
  atr_pct: number
  level: string
  should_pause: boolean
}

interface StrategyRegimeEntry {
  strategy: string
  trending_up: string
  trending_down: string
  mean_reverting: string
  high_volatility: string
  low_volatility: string
}

// ---------- Regime Styling ----------

const REGIME_STYLES: Record<
  string,
  { label: string; color: string; bgClass: string; borderClass: string }
> = {
  TRENDING_UP: {
    label: "Trending Up",
    color: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
  },
  TRENDING_DOWN: {
    label: "Trending Down",
    color: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
  },
  MEAN_REVERTING: {
    label: "Mean Reverting",
    color: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/30",
  },
  HIGH_VOLATILITY: {
    label: "High Volatility",
    color: "text-amber-400",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
  },
  LOW_VOLATILITY: {
    label: "Low Volatility",
    color: "text-zinc-400",
    bgClass: "bg-zinc-500/10",
    borderClass: "border-zinc-500/30",
  },
}

function getRegimeStyle(regime: string) {
  return (
    REGIME_STYLES[regime] ?? {
      label: regime.replace(/_/g, " "),
      color: "text-muted-foreground",
      bgClass: "bg-muted/10",
      borderClass: "border-muted/30",
    }
  )
}

const VOL_LEVEL_STYLES: Record<string, { color: string; label: string }> = {
  extreme: { color: "text-red-400", label: "EXTREME" },
  high: { color: "text-amber-400", label: "HIGH" },
  normal: { color: "text-emerald-400", label: "NORMAL" },
  low: { color: "text-zinc-400", label: "LOW" },
}

function getVolStyle(level: string) {
  return (
    VOL_LEVEL_STYLES[level] ?? {
      color: "text-muted-foreground",
      label: level.toUpperCase(),
    }
  )
}

// Rating cell icon for strategy-regime matrix
const RATING_STYLES: Record<string, { icon: string; color: string }> = {
  excellent: { icon: "++", color: "text-emerald-400 font-bold" },
  good: { icon: "+", color: "text-emerald-300" },
  neutral: { icon: "~", color: "text-muted-foreground" },
  poor: { icon: "-", color: "text-amber-400" },
  avoid: { icon: "X", color: "text-red-400 font-bold" },
}

function getRating(value: string) {
  return (
    RATING_STYLES[value.toLowerCase()] ?? {
      icon: value,
      color: "text-muted-foreground",
    }
  )
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${hours.toFixed(1)}h`
  const days = Math.floor(hours / 24)
  const remaining = hours % 24
  if (remaining === 0) return `${days}d`
  return `${days}d ${remaining.toFixed(0)}h`
}

// ---------- Component ----------

interface RegimeDashboardProps {
  initialRegimes: RegimeInfo[]
  initialVolatility: VolatilityStatus[]
  initialStrategyMap: StrategyRegimeEntry[]
}

export function RegimeDashboard({
  initialRegimes,
  initialVolatility,
  initialStrategyMap,
}: RegimeDashboardProps) {
  const [regimes, setRegimes] = useState<RegimeInfo[]>(initialRegimes)
  const [volatility, setVolatility] =
    useState<VolatilityStatus[]>(initialVolatility)
  const [strategyMap, setStrategyMap] =
    useState<StrategyRegimeEntry[]>(initialStrategyMap)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [regimeRes, volRes, mapRes] = await Promise.all([
        fetch(`${API_URL}/regime/current?symbols=BTC,ETH,SOL`).catch(
          () => null
        ),
        fetch(`${API_URL}/regime/volatility?symbols=BTC,ETH,SOL`).catch(
          () => null
        ),
        fetch(`${API_URL}/regime/strategy-map`).catch(() => null),
      ])
      if (regimeRes?.ok) {
        const data = await regimeRes.json()
        setRegimes(
          data.map((d: Record<string, unknown>) => ({
            ...d,
            regime: d.current_regime ?? d.regime ?? "UNKNOWN",
          }))
        )
      }
      if (volRes?.ok) setVolatility(await volRes.json())
      if (mapRes?.ok) setStrategyMap(await mapRes.json())
    } catch {
      // silent
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const anyPaused = volatility.some((v) => v.should_pause)

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Volatility Warning ---------- */}
      {anyPaused && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="text-2xl">!</span>
            <div>
              <p className="font-semibold text-red-400">
                Extreme Volatility Detected
              </p>
              <p className="text-sm text-red-300/80">
                {volatility
                  .filter((v) => v.should_pause)
                  .map((v) => v.symbol)
                  .join(", ")}{" "}
                showing extreme volatility. Bots should pause or reduce position
                sizes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Refresh Button ---------- */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* ---------- Regime Cards ---------- */}
      {regimes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {regimes.map((r) => {
            const style = getRegimeStyle(r.regime)
            return (
              <Card
                key={r.symbol}
                className={`${style.bgClass} ${style.borderClass}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{r.symbol}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`${style.color} border-current`}
                    >
                      {style.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Confidence & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Confidence
                      </p>
                      <p
                        className={`text-xl font-bold tabular-nums ${
                          r.confidence >= 70
                            ? "text-emerald-400"
                            : r.confidence >= 40
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {r.confidence.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Duration
                      </p>
                      <p className="text-xl font-bold tabular-nums">
                        {formatDuration(r.duration_hours)}
                      </p>
                    </div>
                  </div>

                  {/* Recommended */}
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Recommended Strategies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {r.recommended_strategies.length > 0 ? (
                        r.recommended_strategies.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px] bg-emerald-500/15 text-emerald-300"
                          >
                            {s.replace(/_/g, " ")}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avoid */}
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Avoid
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {r.avoid_strategies.length > 0 ? (
                        r.avoid_strategies.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-[10px] bg-red-500/15 text-red-300"
                          >
                            {s.replace(/_/g, " ")}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No regime data available. The API may be offline or regime
              detection is not configured.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ---------- Volatility Status ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Volatility Status</CardTitle>
          <CardDescription>
            ATR-based volatility levels per symbol. Extreme = bots should pause.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {volatility.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {volatility.map((v) => {
                const volStyle = getVolStyle(v.level)
                return (
                  <div
                    key={v.symbol}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-semibold">{v.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        ATR(14): {v.atr_14.toFixed(2)} ({v.atr_pct.toFixed(2)}
                        %)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${volStyle.color}`}>
                        {volStyle.label}
                      </p>
                      {v.should_pause && (
                        <p className="text-[10px] font-semibold text-red-400">
                          PAUSE BOTS
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No volatility data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ---------- Strategy-Regime Matrix ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy-Regime Matrix</CardTitle>
          <CardDescription>
            Which strategies work best in each regime. ++ = excellent, + = good,
            ~ = neutral, - = poor, X = avoid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {strategyMap.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead className="text-center">
                      <span className="text-emerald-400">Trend Up</span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="text-red-400">Trend Down</span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="text-blue-400">Mean Revert</span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="text-amber-400">High Vol</span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="text-zinc-400">Low Vol</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyMap.map((entry) => (
                    <TableRow key={entry.strategy}>
                      <TableCell className="font-medium">
                        {entry.strategy.replace(/_/g, " ")}
                      </TableCell>
                      {(
                        [
                          "trending_up",
                          "trending_down",
                          "mean_reverting",
                          "high_volatility",
                          "low_volatility",
                        ] as const
                      ).map((regime) => {
                        const rating = getRating(entry[regime])
                        return (
                          <TableCell
                            key={regime}
                            className={`text-center tabular-nums ${rating.color}`}
                          >
                            {rating.icon}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No strategy-regime mapping available. Configure regime detection
              in the backend to enable this feature.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
