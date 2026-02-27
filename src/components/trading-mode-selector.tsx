"use client"

import { useCallback, useEffect, useState } from "react"

import { api } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MODE_CONFIG = {
  paper: {
    label: "Paper Trading",
    description: "Simulated trades, real prices, no wallet needed",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dot: "bg-blue-500",
  },
  testnet: {
    label: "Testnet",
    description: "Hyperliquid testnet with test USDC",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  mainnet: {
    label: "Mainnet",
    description: "Live trading with real funds",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    dot: "bg-red-500",
  },
} as const

type TradingMode = keyof typeof MODE_CONFIG

export function TradingModeSelector() {
  const [mode, setMode] = useState<TradingMode>("paper")
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current mode on mount
  useEffect(() => {
    api
      .getTradingMode()
      .then((res) => {
        if (res.mode in MODE_CONFIG) {
          setMode(res.mode as TradingMode)
        }
      })
      .catch(() => {
        // API not reachable, default to paper
      })
  }, [])

  const handleSwitch = useCallback(
    async (newMode: string) => {
      if (newMode === mode || switching) return

      // Confirm before switching to mainnet
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
    <div className="flex items-center gap-2">
      <Select value={mode} onValueChange={handleSwitch} disabled={switching}>
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${config.dot} ${switching ? "animate-pulse" : ""}`}
            />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {(Object.entries(MODE_CONFIG) as [TradingMode, (typeof MODE_CONFIG)[TradingMode]][]).map(
            ([key, cfg]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className="font-medium">{cfg.label}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">
                    {cfg.description}
                  </span>
                </div>
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>

      {error && (
        <Badge variant="destructive" className="text-[10px]">
          {error}
        </Badge>
      )}
    </div>
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
    <Badge variant="outline" className={`text-[10px] ${config.color}`}>
      <span className={`mr-1 h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  )
}
