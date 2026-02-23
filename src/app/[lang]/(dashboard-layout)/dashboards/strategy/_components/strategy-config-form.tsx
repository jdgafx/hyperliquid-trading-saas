"use client"

import { useState } from "react"

import { strategyStatusData } from "../_data/strategy"

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

export function StrategyConfigForm() {
  const [symbol, setSymbol] = useState(strategyStatusData.symbol)
  const [timeframe, setTimeframe] = useState(strategyStatusData.timeframe)
  const [lookback, setLookback] = useState(
    String(strategyStatusData.lookbackPeriod)
  )
  const [atrPeriod, setAtrPeriod] = useState(
    String(strategyStatusData.atrPeriod)
  )
  const [atrMultiplier, setAtrMultiplier] = useState(
    String(strategyStatusData.atrMultiplier)
  )
  const [leverage, setLeverage] = useState(String(strategyStatusData.leverage))
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    setSaved(false)
    try {
      await new Promise((r) => setTimeout(r, 600))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Adjust strategy parameters. Changes take effect on next restart.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Symbol</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
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
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lookback">Lookback Period</Label>
            <Input
              id="lookback"
              type="number"
              min="1"
              value={lookback}
              onChange={(e) => setLookback(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="atr-period">ATR Period</Label>
            <Input
              id="atr-period"
              type="number"
              min="1"
              value={atrPeriod}
              onChange={(e) => setAtrPeriod(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="atr-multiplier">ATR Multiplier</Label>
            <Input
              id="atr-multiplier"
              type="number"
              min="0.1"
              step="0.1"
              value={atrMultiplier}
              onChange={(e) => setAtrMultiplier(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leverage">Leverage</Label>
            <Input
              id="leverage"
              type="number"
              min="1"
              max="20"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
          {saved && (
            <span className="text-sm text-green-500">Configuration saved!</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
