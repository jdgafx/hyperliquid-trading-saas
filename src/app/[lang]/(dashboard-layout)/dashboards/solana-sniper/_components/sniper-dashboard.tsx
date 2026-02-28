"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Crosshair,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  Skull,
  Target,
  Zap,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// --- Types ---

interface TokenScan {
  id: string
  name: string
  symbol: string
  mint: string
  marketCap: number
  liquidity: number
  holders: number
  topHolderPct: number
  securityScore: number // 0-100
  age: string // e.g. "2m", "15m", "1h"
  priceChange5m: number
  priceChange1h: number
  volume5m: number
  isFlagged: boolean
  flagReason?: string
}

interface SniperPosition {
  id: string
  tokenName: string
  symbol: string
  mint: string
  entryPrice: number
  currentPrice: number
  size: number
  pnl: number
  pnlPct: number
  entryTime: string
  status: "open" | "tp-hit" | "sl-hit" | "closed"
}

interface SniperConfig {
  enabled: boolean
  minLiquidity: number
  maxMarketCap: number
  minSecurityScore: number
  maxTopHolderPct: number
  autoSnipe: boolean
  takeProfitPct: number
  stopLossPct: number
  positionSizeUsd: number
}

// --- Mock Data ---

function generateMockTokens(): TokenScan[] {
  const names = [
    ["BONKFI", "BFI"],
    ["SolCat", "SCAT"],
    ["MoonPepe", "MPEPE"],
    ["DogWifSword", "DWS"],
    ["JupiterX", "JUPX"],
    ["RaydiumGem", "RGEM"],
    ["PhantomGold", "PGLD"],
    ["OrcaWhale", "ORCW"],
    ["DriftKing", "DKING"],
    ["MarinadeMax", "MMAX"],
    ["SaberEdge", "SEDGE"],
    ["TulipFarm", "TULIP"],
  ]

  return names.map(([name, symbol], i) => ({
    id: `token-${i}`,
    name,
    symbol,
    mint: `${symbol.toLowerCase()}...${Math.random().toString(36).slice(2, 8)}`,
    marketCap: Math.floor(Math.random() * 500000) + 5000,
    liquidity: Math.floor(Math.random() * 100000) + 1000,
    holders: Math.floor(Math.random() * 2000) + 10,
    topHolderPct: Math.floor(Math.random() * 60) + 5,
    securityScore: Math.floor(Math.random() * 100),
    age: ["1m", "3m", "8m", "15m", "30m", "1h", "2h", "6h"][
      Math.floor(Math.random() * 8)
    ],
    priceChange5m: (Math.random() - 0.4) * 50,
    priceChange1h: (Math.random() - 0.3) * 200,
    volume5m: Math.floor(Math.random() * 50000) + 100,
    isFlagged: Math.random() > 0.7,
    flagReason: Math.random() > 0.5 ? "Honeypot risk" : "High concentration",
  }))
}

function generateMockPositions(): SniperPosition[] {
  return [
    {
      id: "pos-1",
      tokenName: "BONKFI",
      symbol: "BFI",
      mint: "bfi...x8f2k",
      entryPrice: 0.00023,
      currentPrice: 0.00031,
      size: 50,
      pnl: 17.39,
      pnlPct: 34.78,
      entryTime: "12m ago",
      status: "open",
    },
    {
      id: "pos-2",
      tokenName: "SolCat",
      symbol: "SCAT",
      mint: "scat...p3m9r",
      entryPrice: 0.0015,
      currentPrice: 0.0009,
      size: 25,
      pnl: -10.0,
      pnlPct: -40.0,
      entryTime: "1h ago",
      status: "sl-hit",
    },
  ]
}

function SecurityBadge({ score }: { score: number }) {
  const level =
    score >= 80
      ? {
          label: "Safe",
          color: "text-success bg-success/10 border-success/20",
          icon: CheckCircle2,
        }
      : score >= 50
        ? {
            label: "Caution",
            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            icon: AlertTriangle,
          }
        : {
            label: "Danger",
            color: "text-destructive bg-destructive/10 border-destructive/20",
            icon: Skull,
          }

  const Icon = level.icon

  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", level.color)}>
      <Icon className="size-3" />
      {score}
    </Badge>
  )
}

function formatCompact(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

export function SniperDashboard() {
  const [tokens, setTokens] = useState<TokenScan[]>([])
  const [positions, setPositions] = useState<SniperPosition[]>([])
  const [config, setConfig] = useState<SniperConfig>({
    enabled: false,
    minLiquidity: 5000,
    maxMarketCap: 500000,
    minSecurityScore: 40,
    maxTopHolderPct: 50,
    autoSnipe: false,
    takeProfitPct: 100,
    stopLossPct: 30,
    positionSizeUsd: 25,
  })
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("marketCap")
  const [scanning, setScanning] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    setTokens(generateMockTokens())
    setPositions(generateMockPositions())
  }, [])

  const handleScan = useCallback(() => {
    setScanning(true)
    setTimeout(() => {
      setTokens(generateMockTokens())
      setScanning(false)
    }, 1500)
  }, [])

  // Filter tokens
  const filteredTokens = useMemo(() => {
    const result = tokens.filter((t) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.symbol.toLowerCase().includes(q)
        )
          return false
      }
      if (t.liquidity < config.minLiquidity) return false
      if (t.marketCap > config.maxMarketCap) return false
      if (t.securityScore < config.minSecurityScore) return false
      if (t.topHolderPct > config.maxTopHolderPct) return false
      return true
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case "marketCap":
          return b.marketCap - a.marketCap
        case "liquidity":
          return b.liquidity - a.liquidity
        case "security":
          return b.securityScore - a.securityScore
        case "change5m":
          return b.priceChange5m - a.priceChange5m
        case "volume":
          return b.volume5m - a.volume5m
        default:
          return 0
      }
    })

    return result
  }, [tokens, search, sortBy, config])

  // Position stats
  const openPositions = positions.filter((p) => p.status === "open")
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0)

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Crosshair className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Scanner
              </p>
              <p className="text-lg font-bold font-data">
                {config.enabled ? (
                  <span className="text-success">Active</span>
                ) : (
                  <span className="text-muted-foreground">Off</span>
                )}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-3/10">
              <Target className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tokens Found
              </p>
              <p className="text-lg font-bold font-data">
                {filteredTokens.length}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-3 border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
              <Zap className="size-4 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Open Positions
              </p>
              <p className="text-lg font-bold font-data">
                {openPositions.length}
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
              {totalPnl >= 0 ? (
                <ArrowUpRight className="size-4 text-success" />
              ) : (
                <ArrowDownRight className="size-4 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Snipe P&L
              </p>
              <p
                className={cn(
                  "text-lg font-bold font-data",
                  totalPnl >= 0
                    ? "text-success glow-profit"
                    : "text-destructive glow-loss"
                )}
              >
                {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* Controls + Config */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scanner toggle */}
          <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2">
            <Crosshair
              className={cn(
                "size-4",
                config.enabled ? "text-success" : "text-muted-foreground"
              )}
            />
            <span className="text-xs font-medium">Scanner</span>
            <Switch
              checked={config.enabled}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))}
            />
          </div>

          {/* Auto-snipe toggle */}
          <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2">
            <Zap
              className={cn(
                "size-4",
                config.autoSnipe ? "text-amber-400" : "text-muted-foreground"
              )}
            />
            <span className="text-xs font-medium">Auto-Snipe</span>
            <Switch
              checked={config.autoSnipe}
              onCheckedChange={(v) =>
                setConfig((c) => ({ ...c, autoSnipe: v }))
              }
            />
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-card/80 text-sm"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[130px] text-xs bg-card/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="liquidity">Liquidity</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="change5m">5m Change</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings2 className="size-3.5" />
            Config
          </Button>

          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs bg-primary"
            onClick={handleScan}
            disabled={scanning}
          >
            {scanning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Scan Now
          </Button>
        </div>

        {/* Config panel (collapsible) */}
        {showConfig && (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sniper Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Min Liquidity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Min Liquidity
                    </label>
                    <span className="text-xs font-data font-semibold">
                      {formatCompact(config.minLiquidity)}
                    </span>
                  </div>
                  <Slider
                    value={[config.minLiquidity]}
                    onValueChange={([v]) =>
                      setConfig((c) => ({ ...c, minLiquidity: v }))
                    }
                    min={1000}
                    max={100000}
                    step={1000}
                  />
                </div>

                {/* Max Market Cap */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Max Market Cap
                    </label>
                    <span className="text-xs font-data font-semibold">
                      {formatCompact(config.maxMarketCap)}
                    </span>
                  </div>
                  <Slider
                    value={[config.maxMarketCap]}
                    onValueChange={([v]) =>
                      setConfig((c) => ({ ...c, maxMarketCap: v }))
                    }
                    min={10000}
                    max={5000000}
                    step={10000}
                  />
                </div>

                {/* Min Security Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Min Security Score
                    </label>
                    <span className="text-xs font-data font-semibold">
                      {config.minSecurityScore}
                    </span>
                  </div>
                  <Slider
                    value={[config.minSecurityScore]}
                    onValueChange={([v]) =>
                      setConfig((c) => ({ ...c, minSecurityScore: v }))
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Max Top Holder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Max Top Holder %
                    </label>
                    <span className="text-xs font-data font-semibold">
                      {config.maxTopHolderPct}%
                    </span>
                  </div>
                  <Slider
                    value={[config.maxTopHolderPct]}
                    onValueChange={([v]) =>
                      setConfig((c) => ({ ...c, maxTopHolderPct: v }))
                    }
                    min={5}
                    max={100}
                    step={5}
                  />
                </div>

                {/* TP / SL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Take Profit %
                    </label>
                    <span className="text-xs font-data font-semibold text-success">
                      +{config.takeProfitPct}%
                    </span>
                  </div>
                  <Slider
                    value={[config.takeProfitPct]}
                    onValueChange={([v]) =>
                      setConfig((c) => ({ ...c, takeProfitPct: v }))
                    }
                    min={10}
                    max={500}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Stop Loss %
                    </label>
                    <span className="text-xs font-data font-semibold text-destructive">
                      -{config.stopLossPct}%
                    </span>
                  </div>
                  <Slider
                    value={[config.stopLossPct]}
                    onValueChange={([v]) =>
                      setConfig((c) => ({ ...c, stopLossPct: v }))
                    }
                    min={5}
                    max={80}
                    step={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main content: Token Scanner + Positions */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Token scanner table */}
          <Card className="lg:col-span-2 overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Crosshair className="size-4 text-primary" />
                  Token Scanner
                  {scanning && (
                    <Loader2 className="size-3 animate-spin text-primary" />
                  )}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {filteredTokens.length} tokens
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Token
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        MCap
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Liq.
                      </TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Security
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Top Hold
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        5m %
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Age
                      </TableHead>
                      <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-32 text-center text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Crosshair className="size-8 opacity-20" />
                            <p className="text-sm">No tokens match filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTokens.map((token) => (
                        <TableRow
                          key={token.id}
                          className={cn(
                            "border-border/20 transition-colors hover:bg-primary/[0.03]",
                            token.isFlagged && "bg-destructive/[0.02]"
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {token.isFlagged && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <ShieldAlert className="size-3.5 text-destructive" />
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs">
                                    {token.flagReason}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <div>
                                <p className="font-semibold text-sm">
                                  {token.symbol}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {token.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-data text-sm">
                            {formatCompact(token.marketCap)}
                          </TableCell>
                          <TableCell className="text-right font-data text-sm">
                            {formatCompact(token.liquidity)}
                          </TableCell>
                          <TableCell className="text-center">
                            <SecurityBadge score={token.securityScore} />
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-data text-sm",
                                token.topHolderPct > 50
                                  ? "text-destructive"
                                  : token.topHolderPct > 30
                                    ? "text-amber-500"
                                    : "text-muted-foreground"
                              )}
                            >
                              {token.topHolderPct}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-data text-sm font-medium",
                                token.priceChange5m >= 0
                                  ? "text-success"
                                  : "text-destructive"
                              )}
                            >
                              {token.priceChange5m >= 0 ? "+" : ""}
                              {token.priceChange5m.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-data text-sm text-muted-foreground">
                            {token.age}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 px-2 text-[10px] font-semibold"
                              disabled={token.isFlagged}
                            >
                              <Crosshair className="size-3" />
                              Snipe
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Active positions */}
          <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Target className="size-4 text-violet-400" />
                Snipe Positions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {positions.length === 0 ? (
                <div className="card-grid-bg flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Target className="size-8 opacity-30" />
                  <p className="text-sm">No snipe positions</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {positions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-primary/[0.03]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm">{pos.symbol}</p>
                          {pos.status === "open" ? (
                            <Badge className="h-4 gap-0.5 border-success/20 bg-success/10 px-1 text-[9px] text-success">
                              <span className="relative flex h-1 w-1">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex h-1 w-1 rounded-full bg-success" />
                              </span>
                              Open
                            </Badge>
                          ) : pos.status === "tp-hit" ? (
                            <Badge className="h-4 px-1 text-[9px] bg-success/10 text-success border-success/20">
                              TP
                            </Badge>
                          ) : pos.status === "sl-hit" ? (
                            <Badge className="h-4 px-1 text-[9px] bg-destructive/10 text-destructive border-destructive/20">
                              SL
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="h-4 px-1 text-[9px]"
                            >
                              Closed
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {pos.entryTime} | ${pos.size}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={cn(
                            "text-sm font-bold font-data",
                            pos.pnl >= 0
                              ? "text-success glow-profit"
                              : "text-destructive glow-loss"
                          )}
                        >
                          {pos.pnl >= 0 ? "+" : ""}$
                          {Math.abs(pos.pnl).toFixed(2)}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] font-data",
                            pos.pnlPct >= 0
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          {pos.pnlPct >= 0 ? "+" : ""}
                          {pos.pnlPct.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
