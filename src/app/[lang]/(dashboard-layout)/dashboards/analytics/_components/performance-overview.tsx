import { cn } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PerformanceMetrics {
  totalPnl: number
  winRate: number
  totalTrades: number
  maxDrawdown: number
  bestTrade: number
  worstTrade: number
  sharpeRatio: number
  vaultEquity: number
}

interface PerformanceOverviewProps {
  metrics: PerformanceMetrics
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function PerformanceOverview({ metrics }: PerformanceOverviewProps) {
  const { totalPnl, winRate, totalTrades, maxDrawdown } = metrics

  if (totalTrades === 0) {
    return (
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-32 items-center justify-center">
          <p className="text-center text-sm text-muted-foreground">
            No trading data yet — start a strategy to see performance metrics.
          </p>
        </CardContent>
      </Card>
    )
  }

  const cards = [
    {
      label: "Total P&L",
      value: formatCurrency(totalPnl),
      valueClass: cn(
        "text-2xl font-bold tabular-nums",
        totalPnl >= 0 ? "text-success" : "text-destructive"
      ),
      sub: totalPnl >= 0 ? "Profitable" : "In drawdown",
      subClass: totalPnl >= 0 ? "text-success/70" : "text-destructive/70",
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      valueClass: cn(
        "text-2xl font-bold tabular-nums",
        winRate >= 50 ? "text-success" : "text-amber-500"
      ),
      sub: `${Math.round(winRate)}% of trades won`,
      subClass: "text-muted-foreground",
    },
    {
      label: "Total Trades",
      value: totalTrades.toLocaleString(),
      valueClass: "text-2xl font-bold tabular-nums",
      sub: "Closed positions",
      subClass: "text-muted-foreground",
    },
    {
      label: "Max Drawdown",
      value: formatCurrency(maxDrawdown),
      valueClass: "text-2xl font-bold tabular-nums text-destructive",
      sub: "Peak-to-trough loss",
      subClass: "text-muted-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className={card.valueClass}>{card.value}</p>
            <p className={cn("mt-1 text-xs", card.subClass)}>{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
