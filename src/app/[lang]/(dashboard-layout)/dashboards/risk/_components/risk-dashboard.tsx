"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

// ── Types ───────────────────────────────────────

interface RiskConfig {
  max_daily_loss_pct: number
  max_leverage: number
  max_margin_pct: number
  stop_loss_pct: number
  take_profit_pct: number
  trailing_stop_pct: number | null
  anti_tilt_lockout_hours: number
  liquidation_pause_threshold: number
  auto_withdraw_on_max_loss: boolean
}

interface RiskSnapshot {
  account_value: number
  daily_pnl: number
  daily_pnl_pct: number
  margin_usage_pct: number
  current_leverage: number
  open_positions: number
}

interface RiskEvent {
  id: string
  timestamp: string
  severity: "info" | "warning" | "critical" | "emergency"
  message: string
  details?: string
}

type RiskStatus = "monitoring" | "warning" | "locked_out" | "inactive"

interface RiskApiSnapshot {
  status: RiskStatus
  account_value: number
  daily_pnl: number
  daily_pnl_pct: number
  margin_usage_pct: number
  max_position_leverage: number
  open_positions: number
}

interface RiskStatusResponse {
  config: RiskConfig
  snapshot: RiskApiSnapshot
  recent_events: RiskEvent[]
}

// ── Defaults ────────────────────────────────────

const DEFAULT_CONFIG: RiskConfig = {
  max_daily_loss_pct: 3,
  max_leverage: 10,
  max_margin_pct: 10,
  stop_loss_pct: 5,
  take_profit_pct: 10,
  trailing_stop_pct: null,
  anti_tilt_lockout_hours: 12,
  liquidation_pause_threshold: 250000,
  auto_withdraw_on_max_loss: false,
}

const DEFAULT_SNAPSHOT: RiskSnapshot = {
  account_value: 0,
  daily_pnl: 0,
  daily_pnl_pct: 0,
  margin_usage_pct: 0,
  current_leverage: 0,
  open_positions: 0,
}

const API_BASE =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : "http://localhost:8000"

// ── API Helpers ─────────────────────────────────

async function fetchRiskStatus(): Promise<RiskStatusResponse> {
  const res = await fetch(`${API_BASE}/risk/status`, {
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function updateRiskConfig(config: RiskConfig): Promise<void> {
  const res = await fetch(`${API_BASE}/risk/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
}

async function startRiskMonitoring(): Promise<void> {
  const res = await fetch(`${API_BASE}/risk/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
}

async function stopRiskMonitoring(): Promise<void> {
  const res = await fetch(`${API_BASE}/risk/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
}

// ── Status Display Helpers ──────────────────────

const STATUS_META: Record<
  RiskStatus,
  { label: string; color: string; bg: string; border: string; pulse: boolean }
> = {
  monitoring: {
    label: "MONITORING",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    pulse: true,
  },
  warning: {
    label: "WARNING",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    pulse: true,
  },
  locked_out: {
    label: "LOCKED OUT",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    pulse: false,
  },
  inactive: {
    label: "INACTIVE",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/30",
    pulse: false,
  },
}

const SEVERITY_COLORS: Record<string, string> = {
  info: "text-blue-400",
  warning: "text-amber-400",
  critical: "text-red-400",
  emergency: "text-red-300",
}

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-blue-400",
  warning: "bg-amber-400",
  critical: "bg-red-400",
  emergency: "bg-red-300",
}

// ── Formatting ──────────────────────────────────

function fmtUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function fmtPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

function fmtTimestamp(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  } catch {
    return iso
  }
}

// ── Sub-components ──────────────────────────────

function StatusBanner({ status }: { status: RiskStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.inactive

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${meta.border} ${meta.bg} p-4 md:p-6`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            {meta.pulse && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${meta.color === "text-emerald-400" ? "bg-emerald-400" : "bg-amber-400"} opacity-75`}
              />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${meta.color === "text-emerald-400" ? "bg-emerald-400" : meta.color === "text-amber-400" ? "bg-amber-400" : meta.color === "text-red-400" ? "bg-red-400" : "bg-zinc-400"}`}
            />
          </div>
          <div>
            <span className={`text-lg font-bold tracking-wider ${meta.color}`}>
              {meta.label}
            </span>
            <p className="text-xs text-muted-foreground">
              {status === "monitoring" && "All risk parameters within limits"}
              {status === "warning" &&
                "One or more thresholds approaching limits"}
              {status === "locked_out" &&
                "Trading halted - risk limits breached"}
              {status === "inactive" && "Risk monitoring is not running"}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${meta.border} ${meta.color} border`}
        >
          Layer 0
        </Badge>
      </div>
    </div>
  )
}

function SnapshotGrid({ snapshot }: { snapshot: RiskSnapshot }) {
  const metrics = [
    {
      label: "Account Value",
      value: fmtUsd(snapshot.account_value),
      accent: "text-foreground",
    },
    {
      label: "Daily P&L",
      value: fmtUsd(snapshot.daily_pnl),
      sub: fmtPct(snapshot.daily_pnl_pct),
      accent: snapshot.daily_pnl >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Margin Usage",
      value: `${snapshot.margin_usage_pct.toFixed(1)}%`,
      accent:
        snapshot.margin_usage_pct > 50 ? "text-amber-400" : "text-foreground",
    },
    {
      label: "Current Leverage",
      value: `${snapshot.current_leverage.toFixed(1)}x`,
      accent:
        snapshot.current_leverage > 10 ? "text-amber-400" : "text-foreground",
    },
    {
      label: "Open Positions",
      value: snapshot.open_positions.toString(),
      accent: "text-foreground",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Current Snapshot</CardTitle>
        <CardDescription>Real-time account risk metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-semibold tabular-nums ${m.accent}`}>
                {m.value}
              </p>
              {m.sub && (
                <p className={`text-xs tabular-nums ${m.accent}`}>{m.sub}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EventLog({ events }: { events: RiskEvent[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Event Log</CardTitle>
        <CardDescription>Recent risk monitoring events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          {events.length === 0 ? (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No risk events recorded yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2"
                >
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${SEVERITY_DOT[event.severity] ?? "bg-zinc-400"}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${SEVERITY_COLORS[event.severity] ?? "text-zinc-400"}`}
                      >
                        {event.severity}
                      </span>
                      <span className="flex-shrink-0 text-[10px] tabular-nums text-muted-foreground">
                        {fmtTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">
                      {event.message}
                    </p>
                    {event.details && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ── Slider Field ────────────────────────────────

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  description,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (v: number) => void
  description?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-medium tabular-nums text-blue-400">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
      {description && (
        <p className="text-[10px] text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

// ── Config Form ─────────────────────────────────

function RiskConfigForm({
  config,
  onSave,
  isSaving,
}: {
  config: RiskConfig
  onSave: (cfg: RiskConfig) => void
  isSaving: boolean
}) {
  const [draft, setDraft] = useState<RiskConfig>(config)
  const [trailingEnabled, setTrailingEnabled] = useState(
    config.trailing_stop_pct !== null
  )

  // Re-sync when server config changes
  useEffect(() => {
    setDraft(config)
    setTrailingEnabled(config.trailing_stop_pct !== null)
  }, [config])

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(config)

  function update<K extends keyof RiskConfig>(key: K, value: RiskConfig[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      ...draft,
      trailing_stop_pct: trailingEnabled ? draft.trailing_stop_pct : null,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Risk Configuration
        </CardTitle>
        <CardDescription>
          Define your risk parameters. Changes are applied immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Loss & Profit Limits */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Loss & Profit Limits
            </h4>
            <div className="space-y-4 rounded-md border border-border/50 bg-muted/10 p-4">
              <SliderField
                label="Max Daily Loss"
                value={draft.max_daily_loss_pct}
                min={0.1}
                max={50}
                step={0.1}
                suffix="%"
                onChange={(v) => update("max_daily_loss_pct", v)}
                description="Trading halts if daily loss exceeds this threshold"
              />
              <SliderField
                label="Stop Loss"
                value={draft.stop_loss_pct}
                min={0.1}
                max={50}
                step={0.1}
                suffix="%"
                onChange={(v) => update("stop_loss_pct", v)}
                description="Per-position stop loss percentage"
              />
              <SliderField
                label="Take Profit"
                value={draft.take_profit_pct}
                min={0.1}
                max={200}
                step={0.5}
                suffix="%"
                onChange={(v) => update("take_profit_pct", v)}
                description="Per-position take profit percentage"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Trailing Stop</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={trailingEnabled}
                      onCheckedChange={(checked) => {
                        setTrailingEnabled(checked)
                        if (checked && draft.trailing_stop_pct === null) {
                          update("trailing_stop_pct", 2)
                        }
                      }}
                    />
                    {trailingEnabled && (
                      <span className="text-xs font-medium tabular-nums text-blue-400">
                        {draft.trailing_stop_pct ?? 2}%
                      </span>
                    )}
                  </div>
                </div>
                {trailingEnabled && (
                  <Slider
                    value={[draft.trailing_stop_pct ?? 2]}
                    min={0.1}
                    max={50}
                    step={0.1}
                    onValueChange={([v]) => update("trailing_stop_pct", v)}
                  />
                )}
                <p className="text-[10px] text-muted-foreground">
                  Trail stop-loss behind price by this percentage (optional)
                </p>
              </div>
            </div>
          </div>

          {/* Leverage & Margin */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Leverage & Margin
            </h4>
            <div className="space-y-4 rounded-md border border-border/50 bg-muted/10 p-4">
              <SliderField
                label="Max Leverage"
                value={draft.max_leverage}
                min={1}
                max={100}
                step={1}
                suffix="x"
                onChange={(v) => update("max_leverage", v)}
                description="Maximum allowed leverage across all positions"
              />
              <SliderField
                label="Max Margin Usage"
                value={draft.max_margin_pct}
                min={1}
                max={100}
                step={1}
                suffix="%"
                onChange={(v) => update("max_margin_pct", v)}
                description="Maximum percentage of account used as margin"
              />
            </div>
          </div>

          {/* Safety Controls */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Safety Controls
            </h4>
            <div className="space-y-4 rounded-md border border-border/50 bg-muted/10 p-4">
              <SliderField
                label="Anti-Tilt Lockout"
                value={draft.anti_tilt_lockout_hours}
                min={0}
                max={168}
                step={1}
                suffix="h"
                onChange={(v) => update("anti_tilt_lockout_hours", v)}
                description="Hours locked out after hitting max daily loss"
              />
              <div className="space-y-2">
                <Label className="text-xs">Liquidation Pause Threshold</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={draft.liquidation_pause_threshold}
                    onChange={(e) =>
                      update(
                        "liquidation_pause_threshold",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 font-mono text-xs"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Pause all trading if account value drops below this amount
                </p>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/30 bg-background/50 px-3 py-2">
                <div>
                  <Label className="text-xs">Auto-Withdraw on Max Loss</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Automatically withdraw funds when max daily loss is hit
                  </p>
                </div>
                <Switch
                  checked={draft.auto_withdraw_on_max_loss}
                  onCheckedChange={(checked) =>
                    update("auto_withdraw_on_max_loss", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={!hasChanges || isSaving}
            className="w-full"
            variant={hasChanges ? "default" : "outline"}
          >
            {isSaving
              ? "Saving..."
              : hasChanges
                ? "Save Configuration"
                : "No Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Main Dashboard Component ────────────────────

export function RiskDashboard() {
  const [status, setStatus] = useState<RiskStatus>("inactive")
  const [config, setConfig] = useState<RiskConfig>(DEFAULT_CONFIG)
  const [snapshot, setSnapshot] = useState<RiskSnapshot>(DEFAULT_SNAPSHOT)
  const [events, setEvents] = useState<RiskEvent[]>([])
  const [isToggling, setIsToggling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [connected, setConnected] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchRiskStatus()
      const apiSnapshot = data.snapshot
      setStatus(apiSnapshot.status ?? "inactive")
      setConfig(data.config)
      setSnapshot({
        account_value: apiSnapshot.account_value,
        daily_pnl: apiSnapshot.daily_pnl,
        daily_pnl_pct: apiSnapshot.daily_pnl_pct,
        margin_usage_pct: apiSnapshot.margin_usage_pct,
        current_leverage: apiSnapshot.max_position_leverage ?? 0,
        open_positions: apiSnapshot.open_positions,
      })
      setEvents(data.recent_events)
      setConnected(true)
      setError("")
    } catch {
      // API not available - use fallback state
      setConnected(false)
    }
  }, [])

  // Initial load and polling
  useEffect(() => {
    loadStatus()
    pollRef.current = setInterval(loadStatus, 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [loadStatus])

  async function handleToggle() {
    setIsToggling(true)
    setError("")
    try {
      if (status === "inactive") {
        await startRiskMonitoring()
        setStatus("monitoring")
      } else {
        await stopRiskMonitoring()
        setStatus("inactive")
      }
      await loadStatus()
    } catch {
      setError(
        status === "inactive"
          ? "Failed to start risk monitoring"
          : "Failed to stop risk monitoring"
      )
    } finally {
      setIsToggling(false)
    }
  }

  async function handleSaveConfig(cfg: RiskConfig) {
    setIsSaving(true)
    setError("")
    try {
      await updateRiskConfig(cfg)
      setConfig(cfg)
      await loadStatus()
    } catch {
      setError("Failed to update risk configuration")
    } finally {
      setIsSaving(false)
    }
  }

  const isActive = status !== "inactive"

  return (
    <div className="flex flex-col gap-4">
      {/* Connection indicator */}
      {!connected && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-4 py-2">
          <p className="text-xs text-amber-400">
            Risk API not connected. Showing default configuration. Values will
            sync when the backend is available.
          </p>
        </div>
      )}

      {/* Status Banner */}
      <StatusBanner status={status} />

      {/* Start / Stop Button */}
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className={`h-14 text-base font-semibold tracking-wide transition-all ${
            isActive
              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          } border`}
          onClick={handleToggle}
          disabled={isToggling}
        >
          {isToggling
            ? isActive
              ? "Stopping..."
              : "Starting..."
            : isActive
              ? "STOP RISK MONITORING"
              : "START RISK MONITORING"}
        </Button>
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
      </div>

      {/* Snapshot + Event Log */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SnapshotGrid snapshot={snapshot} />
        <EventLog events={events} />
      </div>

      {/* Risk Configuration Form */}
      <RiskConfigForm
        config={config}
        onSave={handleSaveConfig}
        isSaving={isSaving}
      />
    </div>
  )
}
