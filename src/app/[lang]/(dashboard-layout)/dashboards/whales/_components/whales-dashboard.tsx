"use client"

import { useCallback, useMemo, useState } from "react"

import type { WhaleInfo, WhalePosition, WhaleStats } from "@/lib/api-client"

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

// ---------------------------------------------------------------------------
// Mock data for graceful fallback when API is unavailable
// ---------------------------------------------------------------------------

const MOCK_WHALES: WhaleInfo[] = [
  {
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    label: "Galaxy Digital",
    tags: ["institution", "market-maker"],
    total_deposit: 12_500_000,
    current_equity: 14_230_000,
    pnl: 1_730_000,
    pnl_pct: 13.84,
    is_blown_up: false,
    alert_enabled: true,
    positions: [
      {
        symbol: "BTC",
        side: "long",
        size_usd: 5_200_000,
        entry_price: 94_250,
        mark_price: 96_800,
        unrealized_pnl: 140_500,
        leverage: 3,
        liquidation_price: 72_100,
        distance_to_liq_pct: 25.5,
      },
      {
        symbol: "ETH",
        side: "long",
        size_usd: 2_100_000,
        entry_price: 3_420,
        mark_price: 3_510,
        unrealized_pnl: 55_200,
        leverage: 5,
        liquidation_price: 2_850,
        distance_to_liq_pct: 18.8,
      },
    ],
  },
  {
    address: "0xdeadbeef0000111122223333444455556666aaaa",
    label: "Degen Lord",
    tags: ["degen", "high-leverage"],
    total_deposit: 850_000,
    current_equity: 0,
    pnl: -850_000,
    pnl_pct: -100,
    is_blown_up: true,
    alert_enabled: false,
    positions: [],
  },
  {
    address: "0xabcd1234abcd1234abcd1234abcd1234abcd1234",
    label: "Wintermute",
    tags: ["institution", "arb"],
    total_deposit: 25_000_000,
    current_equity: 28_900_000,
    pnl: 3_900_000,
    pnl_pct: 15.6,
    is_blown_up: false,
    alert_enabled: true,
    positions: [
      {
        symbol: "BTC",
        side: "short",
        size_usd: 8_000_000,
        entry_price: 97_500,
        mark_price: 96_800,
        unrealized_pnl: 57_400,
        leverage: 2,
        liquidation_price: 145_000,
        distance_to_liq_pct: 49.7,
      },
      {
        symbol: "SOL",
        side: "long",
        size_usd: 3_500_000,
        entry_price: 148,
        mark_price: 155,
        unrealized_pnl: 165_500,
        leverage: 5,
        liquidation_price: 122,
        distance_to_liq_pct: 21.3,
      },
      {
        symbol: "ETH",
        side: "long",
        size_usd: 4_200_000,
        entry_price: 3_380,
        mark_price: 3_510,
        unrealized_pnl: 161_400,
        leverage: 3,
        liquidation_price: 2_600,
        distance_to_liq_pct: 25.9,
      },
    ],
  },
  {
    address: "0x9999888877776666555544443333222211110000",
    label: null,
    tags: [],
    total_deposit: 4_200_000,
    current_equity: 3_100_000,
    pnl: -1_100_000,
    pnl_pct: -26.19,
    is_blown_up: false,
    alert_enabled: false,
    positions: [
      {
        symbol: "BTC",
        side: "long",
        size_usd: 2_800_000,
        entry_price: 99_200,
        mark_price: 96_800,
        unrealized_pnl: -67_700,
        leverage: 10,
        liquidation_price: 90_500,
        distance_to_liq_pct: 6.5,
      },
    ],
  },
  {
    address: "0xfeed1234cafe5678babe9012dead3456beef7890",
    label: "Jump Trading",
    tags: ["institution"],
    total_deposit: 18_000_000,
    current_equity: 21_500_000,
    pnl: 3_500_000,
    pnl_pct: 19.44,
    is_blown_up: false,
    alert_enabled: true,
    positions: [
      {
        symbol: "BTC",
        side: "long",
        size_usd: 12_000_000,
        entry_price: 92_000,
        mark_price: 96_800,
        unrealized_pnl: 625_200,
        leverage: 2,
        liquidation_price: 48_000,
        distance_to_liq_pct: 50.4,
      },
    ],
  },
  {
    address: "0x0000aaaa1111bbbb2222cccc3333dddd4444eeee",
    label: "YOLO Andy",
    tags: ["degen"],
    total_deposit: 320_000,
    current_equity: 0,
    pnl: -320_000,
    pnl_pct: -100,
    is_blown_up: true,
    alert_enabled: false,
    positions: [],
  },
]

const MOCK_STATS: WhaleStats = {
  total_tracked: 127,
  blown_up_count: 34,
  blown_up_pct: 26.77,
  total_whale_equity: 245_800_000,
  avg_leverage: 4.2,
  top_profitable_count: 48,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : ""

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatUsd(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

function formatPnl(value: number): string {
  const prefix = value >= 0 ? "+" : ""
  return `${prefix}${formatUsd(value)}`
}

function formatPct(value: number): string {
  const prefix = value >= 0 ? "+" : ""
  return `${prefix}${value.toFixed(2)}%`
}

function pnlColor(value: number): string {
  if (value > 0) return "text-success"
  if (value < 0) return "text-destructive"
  return "text-muted-foreground"
}

function liqDistanceColor(pct: number | null): string {
  if (pct === null) return "text-muted-foreground"
  if (pct < 5) return "text-destructive font-bold"
  if (pct < 15) return "text-amber-400"
  return "text-success"
}

type SortField =
  | "equity"
  | "pnl"
  | "pnl_pct"
  | "positions"
  | "leverage"
  | "deposit"
type SortDir = "asc" | "desc"

// ---------------------------------------------------------------------------
// Stats Banner
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: "red" | "green" | "default"
}) {
  const accentClass =
    accent === "red"
      ? "text-destructive"
      : accent === "green"
        ? "text-success"
        : "text-foreground"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wider">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold font-mono ${accentClass}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Position Detail Row
// ---------------------------------------------------------------------------

function PositionRow({ pos }: { pos: WhalePosition }) {
  return (
    <TableRow className="bg-muted/20">
      <TableCell className="pl-8 font-mono text-xs">{pos.symbol}</TableCell>
      <TableCell>
        <Badge variant={pos.side === "long" ? "default" : "destructive"}>
          {pos.side.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-xs">
        {formatUsd(pos.size_usd)}
      </TableCell>
      <TableCell className="font-mono text-xs">
        ${pos.entry_price.toLocaleString()}
      </TableCell>
      <TableCell className="font-mono text-xs">
        ${pos.mark_price.toLocaleString()}
      </TableCell>
      <TableCell
        className={`font-mono text-xs ${pnlColor(pos.unrealized_pnl)}`}
      >
        {formatPnl(pos.unrealized_pnl)}
      </TableCell>
      <TableCell className="font-mono text-xs">{pos.leverage}x</TableCell>
      <TableCell
        className={`font-mono text-xs ${liqDistanceColor(pos.distance_to_liq_pct)}`}
      >
        {pos.distance_to_liq_pct !== null
          ? `${pos.distance_to_liq_pct.toFixed(1)}%`
          : "N/A"}
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Label Editor
// ---------------------------------------------------------------------------

function LabelEditor({
  whale,
  onSave,
}: {
  whale: WhaleInfo
  onSave: (address: string, label: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(whale.label ?? "")

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-left hover:underline text-xs text-muted-foreground"
        title="Click to edit label"
      >
        {whale.label ?? "Add label..."}
      </button>
    )
  }

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(whale.address, value)
        setEditing(false)
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-6 w-28 rounded border border-input bg-background px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        autoFocus
        placeholder="Label..."
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
      >
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => setEditing(false)}
      >
        Cancel
      </Button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

interface WhalesDashboardProps {
  initialWhales: WhaleInfo[]
  initialStats: WhaleStats
}

export function WhalesDashboard({
  initialWhales,
  initialStats,
}: WhalesDashboardProps) {
  // Use mock data when API returns nothing
  const hasMockData = initialWhales.length === 0
  const whalesData = hasMockData ? MOCK_WHALES : initialWhales
  const statsData = initialStats.total_tracked === 0 ? MOCK_STATS : initialStats

  const [whales, setWhales] = useState<WhaleInfo[]>(whalesData)
  const [stats] = useState<WhaleStats>(statsData)
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("equity")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // -- Sorting ----------------------------------------------------------------

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"))
      } else {
        setSortField(field)
        setSortDir("desc")
      }
    },
    [sortField]
  )

  const sortedWhales = useMemo(() => {
    const copy = [...whales]
    const dir = sortDir === "desc" ? -1 : 1

    copy.sort((a, b) => {
      switch (sortField) {
        case "equity":
          return (a.current_equity - b.current_equity) * dir
        case "pnl":
          return (a.pnl - b.pnl) * dir
        case "pnl_pct":
          return (a.pnl_pct - b.pnl_pct) * dir
        case "positions":
          return (a.positions.length - b.positions.length) * dir
        case "leverage": {
          const aLev = a.positions.length
            ? Math.max(...a.positions.map((p) => p.leverage))
            : 0
          const bLev = b.positions.length
            ? Math.max(...b.positions.map((p) => p.leverage))
            : 0
          return (aLev - bLev) * dir
        }
        case "deposit":
          return (a.total_deposit - b.total_deposit) * dir
        default:
          return 0
      }
    })

    return copy
  }, [whales, sortField, sortDir])

  // -- Sort indicator ---------------------------------------------------------

  function SortIndicator({ field }: { field: SortField }) {
    if (sortField !== field) return null
    return (
      <span className="ml-1 text-xs">{sortDir === "desc" ? "v" : "^"}</span>
    )
  }

  // -- API actions ------------------------------------------------------------

  const handleToggleAlert = useCallback(
    async (address: string, enabled: boolean) => {
      setWhales((prev) =>
        prev.map((w) =>
          w.address === address ? { ...w, alert_enabled: enabled } : w
        )
      )
      try {
        await fetch(`${API_BASE}/whales/${address}/alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        })
      } catch {
        // Revert on failure
        setWhales((prev) =>
          prev.map((w) =>
            w.address === address ? { ...w, alert_enabled: !enabled } : w
          )
        )
      }
    },
    []
  )

  const handleSaveLabel = useCallback(
    async (address: string, label: string) => {
      setWhales((prev) =>
        prev.map((w) =>
          w.address === address ? { ...w, label: label || null } : w
        )
      )
      try {
        await fetch(`${API_BASE}/whales/${address}/label`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: label || null }),
        })
      } catch {
        // Silent fail - optimistic update remains
      }
    },
    []
  )

  // -- Render -----------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Whale Intelligence
        </h1>
        <p className="text-sm text-muted-foreground">
          Track the biggest players on HyperLiquid
        </p>
        {hasMockData && (
          <Badge
            variant="outline"
            className="mt-2 text-xs text-amber-400 border-amber-400/30"
          >
            Demo Mode - Showing mock data
          </Badge>
        )}
      </div>

      {/* Stats Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Whales Tracked"
          value={stats.total_tracked.toLocaleString()}
          sub={`${stats.top_profitable_count} profitable`}
        />
        <StatCard
          label="Have Blown Up"
          value={`${stats.blown_up_pct.toFixed(1)}%`}
          sub={`${stats.blown_up_count} of ${stats.total_tracked}`}
          accent="red"
        />
        <StatCard
          label="Total Whale Equity"
          value={formatUsd(stats.total_whale_equity)}
        />
        <StatCard
          label="Average Leverage"
          value={`${stats.avg_leverage.toFixed(1)}x`}
          accent={stats.avg_leverage > 5 ? "red" : "default"}
        />
      </div>

      {/* Whale Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Whale Leaderboard</CardTitle>
          <CardDescription>
            {sortedWhales.length} whales sorted by {sortField.replace("_", " ")}{" "}
            ({sortDir})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Address</TableHead>
                <TableHead className="w-[160px]">Label</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="hover:text-foreground cursor-pointer"
                    onClick={() => handleSort("equity")}
                  >
                    Equity
                    <SortIndicator field="equity" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="hover:text-foreground cursor-pointer"
                    onClick={() => handleSort("pnl")}
                  >
                    P&L
                    <SortIndicator field="pnl" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="hover:text-foreground cursor-pointer"
                    onClick={() => handleSort("pnl_pct")}
                  >
                    P&L %
                    <SortIndicator field="pnl_pct" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="hover:text-foreground cursor-pointer"
                    onClick={() => handleSort("positions")}
                  >
                    Positions
                    <SortIndicator field="positions" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="hover:text-foreground cursor-pointer"
                    onClick={() => handleSort("leverage")}
                  >
                    Max Lev.
                    <SortIndicator field="leverage" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Alert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWhales.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-12"
                  >
                    No whales tracked yet
                  </TableCell>
                </TableRow>
              ) : (
                sortedWhales.map((whale) => {
                  const isExpanded = expandedAddress === whale.address
                  const maxLev = whale.positions.length
                    ? Math.max(...whale.positions.map((p) => p.leverage))
                    : 0

                  return (
                    <WhaleRow
                      key={whale.address}
                      whale={whale}
                      maxLev={maxLev}
                      isExpanded={isExpanded}
                      onToggleExpand={() =>
                        setExpandedAddress(isExpanded ? null : whale.address)
                      }
                      onToggleAlert={handleToggleAlert}
                      onSaveLabel={handleSaveLabel}
                    />
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Whale Row (extracted to reduce re-renders)
// ---------------------------------------------------------------------------

function WhaleRow({
  whale,
  maxLev,
  isExpanded,
  onToggleExpand,
  onToggleAlert,
  onSaveLabel,
}: {
  whale: WhaleInfo
  maxLev: number
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleAlert: (address: string, enabled: boolean) => void
  onSaveLabel: (address: string, label: string) => void
}) {
  return (
    <>
      {/* Main row */}
      <TableRow
        className={`cursor-pointer ${isExpanded ? "bg-muted/30" : ""} ${whale.is_blown_up ? "opacity-60" : ""}`}
        onClick={onToggleExpand}
      >
        <TableCell className="font-mono text-xs">
          {truncateAddress(whale.address)}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1">
            <LabelEditor whale={whale} onSave={onSaveLabel} />
            {whale.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {whale.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="font-mono text-xs">
          {formatUsd(whale.current_equity)}
        </TableCell>
        <TableCell className={`font-mono text-xs ${pnlColor(whale.pnl)}`}>
          {formatPnl(whale.pnl)}
        </TableCell>
        <TableCell className={`font-mono text-xs ${pnlColor(whale.pnl_pct)}`}>
          {formatPct(whale.pnl_pct)}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {whale.positions.length}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {maxLev > 0 ? `${maxLev}x` : "-"}
        </TableCell>
        <TableCell>
          {whale.is_blown_up ? (
            <Badge variant="destructive">BLOWN UP</Badge>
          ) : whale.positions.length > 0 ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">Idle</Badge>
          )}
        </TableCell>
        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`inline-flex h-6 w-10 items-center rounded-full transition-colors ${
              whale.alert_enabled ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => onToggleAlert(whale.address, !whale.alert_enabled)}
            title={whale.alert_enabled ? "Disable alerts" : "Enable alerts"}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                whale.alert_enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </TableCell>
      </TableRow>

      {/* Expanded position detail */}
      {isExpanded && whale.positions.length > 0 && (
        <>
          {/* Sub-header for positions */}
          <TableRow className="bg-muted/10 hover:bg-muted/10">
            <TableHead className="pl-8 text-[10px]">Symbol</TableHead>
            <TableHead className="text-[10px]">Side</TableHead>
            <TableHead className="text-[10px]">Size</TableHead>
            <TableHead className="text-[10px]">Entry</TableHead>
            <TableHead className="text-[10px]">Mark</TableHead>
            <TableHead className="text-[10px]">Unr. P&L</TableHead>
            <TableHead className="text-[10px]">Lev.</TableHead>
            <TableHead className="text-[10px]">Dist. to Liq.</TableHead>
            <TableHead />
          </TableRow>
          {whale.positions.map((pos) => (
            <PositionRow
              key={`${whale.address}-${pos.symbol}-${pos.side}`}
              pos={pos}
            />
          ))}
        </>
      )}

      {/* Expanded but no positions (blown up) */}
      {isExpanded && whale.positions.length === 0 && (
        <TableRow className="bg-muted/10">
          <TableCell
            colSpan={9}
            className="text-center text-xs text-muted-foreground py-6"
          >
            {whale.is_blown_up
              ? "All positions liquidated - account blown up"
              : "No open positions"}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
