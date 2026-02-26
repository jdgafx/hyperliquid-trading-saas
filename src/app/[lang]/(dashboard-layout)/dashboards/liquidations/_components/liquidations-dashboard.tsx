"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Flame,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"

import type {
  LiquidationHeatmapLevel,
  LiquidationVolume,
  NearLiquidation,
  SafetyStatus,
} from "@/lib/api-client"

import { Badge } from "@/components/ui/badge"
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

// -- Types for liquidation events (not yet in api-client) --

interface LiquidationEvent {
  symbol: string
  side: string
  size_usd: number
  price: number
  timestamp: string
}

// -- API helpers --

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchLiq<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// -- Mock/fallback data --

const MOCK_SAFETY: SafetyStatus = {
  is_safe_to_trade: true,
  recent_liquidation_volume: 2_340_000,
  threshold: 50_000_000,
  message: "Liquidation volume is within normal range",
}

const MOCK_HEATMAP: LiquidationHeatmapLevel[] = Array.from(
  { length: 15 },
  (_, i) => {
    const base = 95_000 + i * 500
    return {
      price_level: base,
      total_long_liq_usd: Math.random() * 8_000_000 + 200_000,
      total_short_liq_usd: Math.random() * 6_000_000 + 200_000,
      position_count: Math.floor(Math.random() * 40 + 5),
    }
  }
)

const MOCK_NEAR: NearLiquidation[] = [
  {
    address: "0xabc...1234",
    symbol: "BTC",
    side: "long",
    size_usd: 2_500_000,
    leverage: 50,
    liquidation_price: 94_800,
    mark_price: 95_200,
    distance_pct: 0.42,
  },
  {
    address: "0xdef...5678",
    symbol: "ETH",
    side: "short",
    size_usd: 1_800_000,
    leverage: 25,
    liquidation_price: 3_520,
    mark_price: 3_480,
    distance_pct: 1.15,
  },
  {
    address: "0x111...aaaa",
    symbol: "BTC",
    side: "long",
    size_usd: 4_200_000,
    leverage: 100,
    liquidation_price: 94_500,
    mark_price: 95_200,
    distance_pct: 0.74,
  },
  {
    address: "0x222...bbbb",
    symbol: "SOL",
    side: "short",
    size_usd: 900_000,
    leverage: 20,
    liquidation_price: 178,
    mark_price: 174,
    distance_pct: 2.3,
  },
  {
    address: "0x333...cccc",
    symbol: "ETH",
    side: "long",
    size_usd: 3_100_000,
    leverage: 50,
    liquidation_price: 3_390,
    mark_price: 3_480,
    distance_pct: 2.59,
  },
  {
    address: "0x444...dddd",
    symbol: "BTC",
    side: "short",
    size_usd: 1_400_000,
    leverage: 10,
    liquidation_price: 98_000,
    mark_price: 95_200,
    distance_pct: 2.86,
  },
  {
    address: "0x555...eeee",
    symbol: "DOGE",
    side: "long",
    size_usd: 600_000,
    leverage: 50,
    liquidation_price: 0.37,
    mark_price: 0.39,
    distance_pct: 4.12,
  },
  {
    address: "0x666...ffff",
    symbol: "BTC",
    side: "long",
    size_usd: 7_800_000,
    leverage: 25,
    liquidation_price: 91_200,
    mark_price: 95_200,
    distance_pct: 4.2,
  },
]

const MOCK_VOLUME: LiquidationVolume[] = [
  {
    window: "5m",
    total_liquidated_usd: 340_000,
    long_liquidated_usd: 200_000,
    short_liquidated_usd: 140_000,
    event_count: 12,
  },
  {
    window: "15m",
    total_liquidated_usd: 890_000,
    long_liquidated_usd: 520_000,
    short_liquidated_usd: 370_000,
    event_count: 34,
  },
  {
    window: "30m",
    total_liquidated_usd: 1_450_000,
    long_liquidated_usd: 830_000,
    short_liquidated_usd: 620_000,
    event_count: 52,
  },
  {
    window: "1h",
    total_liquidated_usd: 2_340_000,
    long_liquidated_usd: 1_300_000,
    short_liquidated_usd: 1_040_000,
    event_count: 89,
  },
  {
    window: "4h",
    total_liquidated_usd: 8_200_000,
    long_liquidated_usd: 5_100_000,
    short_liquidated_usd: 3_100_000,
    event_count: 312,
  },
  {
    window: "24h",
    total_liquidated_usd: 34_500_000,
    long_liquidated_usd: 19_200_000,
    short_liquidated_usd: 15_300_000,
    event_count: 1_240,
  },
]

const MOCK_EVENTS: LiquidationEvent[] = [
  {
    symbol: "BTC",
    side: "long",
    size_usd: 420_000,
    price: 94_650,
    timestamp: new Date(Date.now() - 30_000).toISOString(),
  },
  {
    symbol: "ETH",
    side: "short",
    size_usd: 180_000,
    price: 3_512,
    timestamp: new Date(Date.now() - 90_000).toISOString(),
  },
  {
    symbol: "BTC",
    side: "long",
    size_usd: 1_200_000,
    price: 94_320,
    timestamp: new Date(Date.now() - 150_000).toISOString(),
  },
  {
    symbol: "SOL",
    side: "long",
    size_usd: 85_000,
    price: 172.4,
    timestamp: new Date(Date.now() - 220_000).toISOString(),
  },
  {
    symbol: "ETH",
    side: "long",
    size_usd: 340_000,
    price: 3_401,
    timestamp: new Date(Date.now() - 300_000).toISOString(),
  },
  {
    symbol: "BTC",
    side: "short",
    size_usd: 2_100_000,
    price: 96_100,
    timestamp: new Date(Date.now() - 420_000).toISOString(),
  },
  {
    symbol: "DOGE",
    side: "long",
    size_usd: 45_000,
    price: 0.368,
    timestamp: new Date(Date.now() - 540_000).toISOString(),
  },
  {
    symbol: "BTC",
    side: "long",
    size_usd: 780_000,
    price: 94_100,
    timestamp: new Date(Date.now() - 720_000).toISOString(),
  },
  {
    symbol: "ETH",
    side: "short",
    size_usd: 560_000,
    price: 3_540,
    timestamp: new Date(Date.now() - 900_000).toISOString(),
  },
  {
    symbol: "BTC",
    side: "long",
    size_usd: 3_400_000,
    price: 93_800,
    timestamp: new Date(Date.now() - 1_100_000).toISOString(),
  },
]

// -- Formatting helpers --

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

function formatPrice(n: number): string {
  if (n >= 1_000)
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(4)}`
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function distanceColor(pct: number): string {
  if (pct < 1) return "text-red-400"
  if (pct < 2) return "text-yellow-400"
  if (pct < 5) return "text-blue-400"
  return "text-muted-foreground"
}

function distanceBgColor(pct: number): string {
  if (pct < 1) return "bg-red-500/10"
  if (pct < 2) return "bg-yellow-500/10"
  if (pct < 5) return "bg-blue-500/10"
  return ""
}

// -- Sort utilities --

type SortField = "symbol" | "side" | "size_usd" | "leverage" | "distance_pct"
type SortDir = "asc" | "desc"

function sortNear(
  data: NearLiquidation[],
  field: SortField,
  dir: SortDir
): NearLiquidation[] {
  return [...data].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (typeof aVal === "string" && typeof bVal === "string") {
      return dir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return dir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })
}

// -- Custom tooltip components --

interface TooltipPayloadEntry {
  dataKey: string
  color: string
  name: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string | number
}

function HeatmapTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover p-3 text-sm shadow-xl">
      <p className="mb-1 font-semibold text-foreground">
        {formatPrice(label as number)}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {formatUsd(Math.abs(entry.value))}
        </p>
      ))}
    </div>
  )
}

function VolumeTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover p-3 text-sm shadow-xl">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {formatUsd(entry.value)}
        </p>
      ))}
    </div>
  )
}

// -- Main component --

export function LiquidationsDashboard() {
  const [safety, setSafety] = useState<SafetyStatus>(MOCK_SAFETY)
  const [heatmap, setHeatmap] =
    useState<LiquidationHeatmapLevel[]>(MOCK_HEATMAP)
  const [near, setNear] = useState<NearLiquidation[]>(MOCK_NEAR)
  const [volume, setVolume] = useState<LiquidationVolume[]>(MOCK_VOLUME)
  const [events, setEvents] = useState<LiquidationEvent[]>(MOCK_EVENTS)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const [sortField, setSortField] = useState<SortField>("distance_pct")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [safetyRes, heatmapRes, nearRes, volumeRes, eventsRes] =
      await Promise.all([
        fetchLiq<SafetyStatus>("/liquidations/threshold"),
        fetchLiq<LiquidationHeatmapLevel[]>(
          "/liquidations/heatmap?symbol=BTC&levels=20"
        ),
        fetchLiq<NearLiquidation[]>("/liquidations/near?max_distance_pct=5"),
        fetchLiq<LiquidationVolume[]>("/liquidations/volume"),
        fetchLiq<LiquidationEvent[]>("/liquidations/events?limit=50"),
      ])

    if (safetyRes) setSafety(safetyRes)
    if (heatmapRes) setHeatmap(heatmapRes)
    if (nearRes) setNear(nearRes)
    if (volumeRes) setVolume(volumeRes)
    if (eventsRes) setEvents(eventsRes)

    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 15_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const sortedNear = useMemo(
    () => sortNear(near, sortField, sortDir),
    [near, sortField, sortDir]
  )

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sortIndicator = (field: SortField) => {
    if (field !== sortField) return null
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    )
  }

  // Transform heatmap for the diverging bar chart
  const heatmapChartData = useMemo(
    () =>
      [...heatmap]
        .sort((a, b) => a.price_level - b.price_level)
        .map((level) => ({
          price: level.price_level,
          longLiq: -level.total_long_liq_usd,
          shortLiq: level.total_short_liq_usd,
          count: level.position_count,
        })),
    [heatmap]
  )

  // Volume chart data
  const volumeChartData = useMemo(
    () =>
      volume.map((v) => ({
        window: v.window,
        Longs: v.long_liquidated_usd,
        Shorts: v.short_liquidated_usd,
      })),
    [volume]
  )

  // Summary stats
  const totalNearLiqUsd = useMemo(
    () => near.reduce((sum, n) => sum + n.size_usd, 0),
    [near]
  )
  const criticalCount = useMemo(
    () => near.filter((n) => n.distance_pct < 1).length,
    [near]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Liquidation Intelligence
          </h1>
          <p className="text-muted-foreground">
            See where whales blow up before they do
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <Card
        className={
          safety.is_safe_to_trade
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-red-500/50 bg-red-500/10"
        }
      >
        <CardContent className="flex flex-col items-center gap-3 py-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            {safety.is_safe_to_trade ? (
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-10 w-10 animate-pulse text-red-400" />
            )}
            <div>
              <p
                className={`text-xl font-bold ${
                  safety.is_safe_to_trade ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {safety.is_safe_to_trade
                  ? "SAFE TO TRADE"
                  : "MASS LIQUIDATION EVENT - PAUSE TRADING"}
              </p>
              <p className="text-sm text-muted-foreground">{safety.message}</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Recent Liquidation Volume
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {formatUsd(safety.recent_liquidation_volume)}
            </p>
            <p className="text-xs text-muted-foreground">
              Threshold: {formatUsd(safety.threshold)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
              <Flame className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Near Liquidation
              </p>
              <p className="text-2xl font-bold tabular-nums">{near.length}</p>
              <p className="text-xs text-muted-foreground">
                positions within 5%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Critical (&lt;1%)
              </p>
              <p className="text-2xl font-bold tabular-nums text-red-400">
                {criticalCount}
              </p>
              <p className="text-xs text-muted-foreground">
                about to liquidate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <ArrowDown className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                At-Risk Value
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {formatUsd(totalNearLiqUsd)}
              </p>
              <p className="text-xs text-muted-foreground">
                total exposure near liq
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Heatmap */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Liquidation Heatmap</CardTitle>
            <CardDescription>
              Long liquidations (red/left) vs Short liquidations (green/right)
              by price level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={heatmapChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => formatUsd(Math.abs(v))}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="price"
                    tickFormatter={(v: number) => formatPrice(v)}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    width={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<HeatmapTooltip />} />
                  <Bar
                    dataKey="longLiq"
                    name="Long Liq"
                    fill="#ef4444"
                    radius={[4, 0, 0, 4]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="shortLiq"
                    name="Short Liq"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Liquidation Volume */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Liquidation Volume</CardTitle>
            <CardDescription>
              Total liquidated USD across time windows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={volumeChartData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="window"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => formatUsd(v)}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<VolumeTooltip />} />
                  <Bar
                    dataKey="Longs"
                    name="Long Liquidations"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="Shorts"
                    name="Short Liquidations"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Near Liquidation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Near Liquidation Positions</CardTitle>
          <CardDescription>
            Positions closest to liquidation -- click column headers to sort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("symbol")}
                  >
                    Symbol{sortIndicator("symbol")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("side")}
                  >
                    Side{sortIndicator("side")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort("size_usd")}
                  >
                    Size{sortIndicator("size_usd")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort("leverage")}
                  >
                    Leverage{sortIndicator("leverage")}
                  </TableHead>
                  <TableHead className="text-right">Liq Price</TableHead>
                  <TableHead className="text-right">Mark Price</TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-right"
                    onClick={() => handleSort("distance_pct")}
                  >
                    Distance{sortIndicator("distance_pct")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNear.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No positions near liquidation
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedNear.map((pos, i) => (
                    <TableRow
                      key={`${pos.address}-${pos.symbol}-${i}`}
                      className={distanceBgColor(pos.distance_pct)}
                    >
                      <TableCell className="font-semibold">
                        {pos.symbol}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pos.side === "long" ? "default" : "destructive"
                          }
                          className={
                            pos.side === "long"
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }
                        >
                          {pos.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatUsd(pos.size_usd)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {pos.leverage}x
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatPrice(pos.liquidation_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {formatPrice(pos.mark_price)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono font-bold tabular-nums ${distanceColor(pos.distance_pct)}`}
                      >
                        {pos.distance_pct.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Liquidation Events</CardTitle>
          <CardDescription>
            Live feed of liquidation events across all markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
            {events.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No recent liquidation events
              </p>
            ) : (
              events.map((evt, i) => (
                <div
                  key={`${evt.timestamp}-${evt.symbol}-${i}`}
                  className="flex items-center justify-between rounded-lg border bg-card/50 px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        evt.side === "long"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      <Flame className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <span className="font-semibold">{evt.symbol}</span>{" "}
                        <Badge
                          variant={
                            evt.side === "long" ? "default" : "destructive"
                          }
                          className={`ml-1 text-[10px] ${
                            evt.side === "long"
                              ? "bg-red-600/80 text-white"
                              : "bg-emerald-600/80 text-white"
                          }`}
                        >
                          {evt.side.toUpperCase()} LIQ
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        at {formatPrice(evt.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">
                      {formatUsd(evt.size_usd)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(evt.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
