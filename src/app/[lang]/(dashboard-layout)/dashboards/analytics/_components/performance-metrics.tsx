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

interface PerformanceMetricsProps {
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

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const { bestTrade, worstTrade, sharpeRatio, vaultEquity } = metrics

  const rows: Array<{
    label: string
    value: string
    valueClass?: string
  }> = [
    {
      label: "Best Trade",
      value: formatCurrency(bestTrade),
      valueClass: "text-success",
    },
    {
      label: "Worst Trade",
      value: formatCurrency(worstTrade),
      valueClass: "text-destructive",
    },
    {
      label: "Sharpe Ratio",
      value: sharpeRatio === 0 ? "—" : sharpeRatio.toFixed(2),
      valueClass: "text-foreground",
    },
    {
      label: "Vault Equity",
      value: formatCurrency(vaultEquity),
      valueClass: "text-foreground",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Additional Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-0">
          {rows.map((row, idx) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between py-3",
                idx < rows.length - 1 && "border-b border-border/50"
              )}
            >
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "text-base font-bold tabular-nums",
                  row.valueClass
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
