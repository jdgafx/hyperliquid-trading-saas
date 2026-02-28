"use client"

import { useCallback, useEffect, useState } from "react"
import { CircleDot, Wifi, WifiOff } from "lucide-react"

import { api } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const MODE_CONFIG = {
  paper: {
    label: "Paper",
    fullLabel: "Paper Trading",
    description: "Simulated trades, real prices, no wallet needed",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dot: "bg-blue-500",
    ringColor: "ring-blue-500/30",
    glowColor: "shadow-[0_0_8px_hsl(217_91%_60%/0.3)]",
  },
  testnet: {
    label: "Testnet",
    fullLabel: "Testnet Trading",
    description: "Hyperliquid testnet with test USDC",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    dot: "bg-yellow-500",
    ringColor: "ring-yellow-500/30",
    glowColor: "shadow-[0_0_8px_hsl(48_100%_50%/0.3)]",
  },
  mainnet: {
    label: "Mainnet",
    fullLabel: "LIVE Trading",
    description: "Live trading with real funds",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    dot: "bg-red-500",
    ringColor: "ring-red-500/30",
    glowColor: "shadow-[0_0_8px_hsl(0_84%_60%/0.3)]",
  },
} as const

type TradingMode = keyof typeof MODE_CONFIG

export function TradingModeSelector() {
  const [mode, setMode] = useState<TradingMode>("paper")
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [paperBalance, setPaperBalance] = useState<number | null>(null)

  useEffect(() => {
    api
      .getTradingMode()
      .then((res) => {
        if (res.mode in MODE_CONFIG) {
          setMode(res.mode as TradingMode)
        }
        setConnected(true)
        if (res.stats && typeof res.stats.balance === "number") {
          setPaperBalance(res.stats.balance)
        }
      })
      .catch(() => {
        setConnected(false)
      })
  }, [])

  const handleSwitch = useCallback(
    async (newMode: string) => {
      if (newMode === mode || switching) return

      if (newMode === "mainnet") {
        const confirmed = window.confirm(
          "Switch to MAINNET? This will use REAL funds. All running strategies will be stopped."
        )
        if (!confirmed) return
      }

      setSwitching(true)
      setError(null)

      try {
        const result = await api.setTradingMode(newMode)
        if (result.status === "switched" || result.status === "unchanged") {
          setMode(result.mode as TradingMode)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to switch trading mode"
        )
      } finally {
        setSwitching(false)
      }
    },
    [mode, switching]
  )

  const config = MODE_CONFIG[mode]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Connection indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              {connected ? (
                <Wifi className="size-3.5 text-success" />
              ) : (
                <WifiOff className="size-3.5 text-destructive" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {connected ? "API Connected" : "API Disconnected"}
          </TooltipContent>
        </Tooltip>

        {/* Paper balance badge */}
        {mode === "paper" && paperBalance !== null && (
          <Badge
            variant="outline"
            className="hidden border-blue-500/20 bg-blue-500/5 text-[10px] font-data text-blue-400 sm:flex"
          >
            ${paperBalance.toLocaleString()}
          </Badge>
        )}

        {/* Mode selector */}
        <Select value={mode} onValueChange={handleSwitch} disabled={switching}>
          <SelectTrigger
            className={cn(
              "h-8 w-[130px] gap-1.5 rounded-lg border text-xs font-medium transition-all duration-200",
              config.color,
              config.glowColor
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {switching ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                ) : (
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-[glow-pulse_2s_ease-in-out_infinite] rounded-full opacity-75",
                      config.dot
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    switching ? "bg-amber-400" : config.dot
                  )}
                />
              </span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent align="end">
            {(
              Object.entries(MODE_CONFIG) as [
                TradingMode,
                (typeof MODE_CONFIG)[TradingMode],
              ][]
            ).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <CircleDot
                      className={cn("size-3", cfg.dot.replace("bg-", "text-"))}
                    />
                    <span className="font-medium">{cfg.fullLabel}</span>
                  </div>
                  <span className="ml-5 text-[10px] text-muted-foreground">
                    {cfg.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && (
          <Badge variant="destructive" className="text-[10px]">
            {error}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Compact badge version for the sidebar/header.
 * Just shows the current mode as a colored badge.
 */
export function TradingModeBadge() {
  const [mode, setMode] = useState<TradingMode>("paper")

  useEffect(() => {
    api
      .getTradingMode()
      .then((res) => {
        if (res.mode in MODE_CONFIG) {
          setMode(res.mode as TradingMode)
        }
      })
      .catch(() => {})
  }, [])

  const config = MODE_CONFIG[mode]

  return (
    <Badge variant="outline" className={cn("text-[10px]", config.color)}>
      <span className={cn("mr-1 h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  )
}
