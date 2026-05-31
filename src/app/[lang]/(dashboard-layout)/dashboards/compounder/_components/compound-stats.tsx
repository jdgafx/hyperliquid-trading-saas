import type { CompoundStatus } from "@/lib/api-client"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

interface Props {
  compound: CompoundStatus | null
  winners: number
  running: number
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: "green" | "red" | "default"
}) {
  return (
    <Card className="border-border/50 bg-card/80 p-5 backdrop-blur-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-data text-2xl font-bold",
          accent === "green" && "text-[hsl(185_100%_42%)]",
          accent === "red" && "text-destructive",
          !accent || (accent === "default" && "text-foreground"),
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  )
}

export function CompoundStats({ compound, winners, running }: Props) {
  if (!compound) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-20 animate-pulse border-border/50 bg-muted/20" />
        ))}
      </div>
    )
  }

  const pnl = compound.balance - compound.initial_balance
  const pnlPct = ((pnl / compound.initial_balance) * 100).toFixed(2)
  const fmtUsd = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Balance" value={fmtUsd(compound.balance)} sub="paper account" />
      <StatCard
        label="Total P&L"
        value={`${pnl >= 0 ? "+" : ""}${fmtUsd(pnl)}`}
        sub={`${pnlPct}% since start`}
        accent={pnl >= 0 ? "green" : "red"}
      />
      <StatCard
        label="Investable"
        value={fmtUsd(compound.investable)}
        sub={`${(100 - compound.reserve_pct).toFixed(0)}% of balance`}
      />
      <StatCard
        label="Reserve"
        value={`${compound.reserve_pct.toFixed(0)}%`}
        sub={fmtUsd(compound.balance * (compound.reserve_pct / 100))}
      />
      <StatCard
        label="Winners"
        value={`${winners} / ${running}`}
        sub="running strategies"
        accent={winners > 0 ? "green" : "default"}
      />
      <StatCard
        label="Rebalance"
        value={`${compound.rebalance_interval_minutes}m`}
        sub="compound interval"
      />
    </div>
  )
}
