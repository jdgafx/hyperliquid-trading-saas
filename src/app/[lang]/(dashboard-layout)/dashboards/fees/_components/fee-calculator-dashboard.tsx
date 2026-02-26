"use client"

import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface FeeResult {
  daily_fee_cost: number
  weekly_fee_cost: number
  monthly_fee_cost: number
  yearly_fee_cost: number
  fee_pct_of_balance_daily: number
  fee_pct_of_balance_monthly: number
  days_until_10pct_eaten: number | null
  days_until_25pct_eaten: number | null
  days_until_50pct_eaten: number | null
  days_until_100pct_eaten: number | null
  avg_fee_per_trade: number
  blended_fee_bps: number
  warning: string | null
}

export function FeeCalculatorDashboard() {
  const [balance, setBalance] = useState(10000)
  const [tradesPerDay, setTradesPerDay] = useState(10)
  const [positionSize, setPositionSize] = useState(1000)
  const [makerRatio, setMakerRatio] = useState(0.8)
  const [result, setResult] = useState<FeeResult | null>(null)
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/tools/fee-calculator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_balance: balance,
          avg_trades_per_day: tradesPerDay,
          avg_position_size: positionSize,
          maker_ratio: makerRatio,
          maker_fee_bps: 0.2,
          taker_fee_bps: 3.5,
        }),
      })
      if (res.ok) {
        setResult(await res.json())
      }
    } catch {
      // Calculate locally as fallback
      const makerFee = 0.2 / 10000
      const takerFee = 3.5 / 10000
      const blended = makerRatio * makerFee + (1 - makerRatio) * takerFee
      const feePerTrade = positionSize * blended
      const dailyCost = feePerTrade * tradesPerDay
      const monthCost = dailyCost * 30
      setResult({
        daily_fee_cost: dailyCost,
        weekly_fee_cost: dailyCost * 7,
        monthly_fee_cost: monthCost,
        yearly_fee_cost: dailyCost * 365,
        fee_pct_of_balance_daily: (dailyCost / balance) * 100,
        fee_pct_of_balance_monthly: (monthCost / balance) * 100,
        days_until_10pct_eaten:
          dailyCost > 0 ? (balance * 0.1) / dailyCost : null,
        days_until_25pct_eaten:
          dailyCost > 0 ? (balance * 0.25) / dailyCost : null,
        days_until_50pct_eaten:
          dailyCost > 0 ? (balance * 0.5) / dailyCost : null,
        days_until_100pct_eaten: dailyCost > 0 ? balance / dailyCost : null,
        avg_fee_per_trade: feePerTrade,
        blended_fee_bps: blended * 10000,
        warning:
          monthCost > balance * 0.05
            ? "Fees are eating more than 5% of your account per month!"
            : null,
      })
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  const fmtDays = (n: number | null) =>
    n === null ? "Never" : `${Math.round(n)} days`

  const getDangerLevel = (days: number | null): string => {
    if (days === null) return "text-emerald-400"
    if (days < 30) return "text-red-500"
    if (days < 90) return "text-amber-500"
    if (days < 365) return "text-yellow-400"
    return "text-emerald-400"
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Trading Profile</CardTitle>
          <CardDescription>
            Enter your typical trading parameters to see the slow bleed of fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Account Balance ($)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Trades Per Day
              </label>
              <input
                type="number"
                value={tradesPerDay}
                onChange={(e) => setTradesPerDay(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Avg Position Size ($)
              </label>
              <input
                type="number"
                value={positionSize}
                onChange={(e) => setPositionSize(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Maker Ratio ({Math.round(makerRatio * 100)}% maker /{" "}
                {Math.round((1 - makerRatio) * 100)}% taker)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={makerRatio}
                onChange={(e) => setMakerRatio(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <button
            onClick={calculate}
            disabled={loading}
            className="mt-6 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate Fee Impact"}
          </button>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Warning Banner */}
          {result.warning && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              <span className="font-semibold">Warning:</span> {result.warning}
            </div>
          )}

          {/* Days Until Death - THE headline number */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-red-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">10% Eaten</p>
                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${getDangerLevel(result.days_until_10pct_eaten)}`}
                >
                  {fmtDays(result.days_until_10pct_eaten)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">25% Eaten</p>
                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${getDangerLevel(result.days_until_25pct_eaten)}`}
                >
                  {fmtDays(result.days_until_25pct_eaten)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/20">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">50% Eaten</p>
                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${getDangerLevel(result.days_until_50pct_eaten)}`}
                >
                  {fmtDays(result.days_until_50pct_eaten)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-red-700/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Account Dead</p>
                <p
                  className={`mt-1 text-3xl font-bold tabular-nums ${getDangerLevel(result.days_until_100pct_eaten)}`}
                >
                  {fmtDays(result.days_until_100pct_eaten)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fee Breakdown */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-red-400">
                  ${fmt(result.daily_fee_cost)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fmt(result.fee_pct_of_balance_daily)}% of balance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-red-400">
                  ${fmt(result.monthly_fee_cost)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fmt(result.fee_pct_of_balance_monthly)}% of balance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Yearly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-red-400">
                  ${fmt(result.yearly_fee_cost)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ${fmt(result.avg_fee_per_trade)} avg per trade &middot;{" "}
                  {fmt(result.blended_fee_bps)} bps blended
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Maker vs Taker Insight */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Why Maker-Only Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm font-medium text-emerald-400">
                    100% Maker Orders
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    ${fmt(((positionSize * 0.2) / 10000) * tradesPerDay * 365)}
                    /yr
                  </p>
                  <p className="text-xs text-muted-foreground">
                    0.02% fee per trade
                  </p>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-medium text-red-400">
                    100% Taker Orders
                  </p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    ${fmt(((positionSize * 3.5) / 10000) * tradesPerDay * 365)}
                    /yr
                  </p>
                  <p className="text-xs text-muted-foreground">
                    0.035% fee per trade
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Taker fees are 17.5x more expensive than maker fees on
                HyperLiquid. Market orders = slow death. Always use limit orders
                on the bid/ask.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
