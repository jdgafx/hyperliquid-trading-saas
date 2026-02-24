"use client"

import { useState } from "react"

import { api } from "@/lib/api-client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StrategyControls({
  initialRunning,
}: {
  initialRunning: boolean
}) {
  const [isRunning, setIsRunning] = useState(initialRunning)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleStart() {
    setIsLoading(true)
    setError("")
    try {
      // Try v2 first, fall back to legacy
      try {
        await api.createStrategy({
          name: "turtle-btc",
          strategy_type: "turtle",
          symbol: "BTC",
          timeframe: "1h",
          leverage: 3,
        })
      } catch {
        // Instance may already exist
      }
      await api.startStrategyV2("turtle-btc")
      setIsRunning(true)
    } catch {
      // Fall back to legacy endpoint
      try {
        await api.startStrategy({
          symbol: "BTC",
          timeframe: "1h",
          lookback_period: 55,
          atr_period: 14,
          atr_multiplier: 2.5,
          leverage: 3,
        })
        setIsRunning(true)
      } catch {
        setError("Failed to start strategy")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStop() {
    setIsLoading(true)
    setError("")
    try {
      await api.stopStrategyV2("turtle-btc")
      setIsRunning(false)
    } catch {
      // Fall back to legacy endpoint
      try {
        await api.stopStrategy()
        setIsRunning(false)
      } catch {
        setError("Failed to stop strategy")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Controls</CardTitle>
        <CardDescription>
          {isRunning
            ? "Strategy is currently active and trading."
            : "Strategy is stopped. Start it to resume trading."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleStart}
            disabled={isLoading || isRunning}
          >
            {isLoading && !isRunning ? "Starting..." : "Start Strategy"}
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="flex-1"
            onClick={handleStop}
            disabled={isLoading || !isRunning}
          >
            {isLoading && isRunning ? "Stopping..." : "Stop Strategy"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
