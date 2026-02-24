"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { Trade } from "@/lib/api-client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DashboardCard } from "@/components/dashboards/dashboard-card"

interface TradeDistributionProps {
  trades: Trade[]
}

const chartConfig = {
  wins: { label: "Wins", color: "hsl(var(--success))" },
  losses: { label: "Losses", color: "hsl(var(--destructive))" },
}

export function TradeDistribution({ trades }: TradeDistributionProps) {
  if (trades.length === 0) {
    return (
      <DashboardCard title="Trade Distribution">
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-sm text-muted-foreground">
            No closed trades yet
          </p>
        </div>
      </DashboardCard>
    )
  }

  const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length
  const losses = trades.filter((t) => (t.pnl ?? 0) <= 0).length
  const winRate = ((wins / trades.length) * 100).toFixed(1)

  const data = [{ category: "Results", wins, losses }]

  return (
    <DashboardCard title="Trade Distribution">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-success" />
            <span className="text-muted-foreground">Wins</span>
            <span className="ml-1 font-bold text-success">{wins}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-destructive" />
            <span className="text-muted-foreground">Losses</span>
            <span className="ml-1 font-bold text-destructive">{losses}</span>
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {winRate}% win rate
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-destructive/20">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-success transition-all duration-700"
            style={{ width: `${winRate}%` }}
          />
        </div>
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="category" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="wins"
              fill="var(--color-wins)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="losses"
              fill="var(--color-losses)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </DashboardCard>
  )
}
