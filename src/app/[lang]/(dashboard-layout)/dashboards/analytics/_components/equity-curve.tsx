"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DashboardCard } from "@/components/dashboards/dashboard-card"

interface EquityCurvePoint {
  date: string
  equity: number
  pnl: number
}

interface EquityCurveProps {
  data: EquityCurvePoint[]
}

const POSITIVE_COLOR = "hsl(142, 71%, 45%)"
const NEGATIVE_COLOR = "hsl(0, 72%, 51%)"

function formatDateTick(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function formatCurrencyCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function EquityCurve({ data }: EquityCurveProps) {
  const lastEquity = data.length > 0 ? data[data.length - 1].equity : 0
  const lineColor = lastEquity >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR

  const chartConfig = {
    equity: { label: "Equity", color: lineColor },
  }

  if (data.length === 0) {
    return (
      <DashboardCard title="Equity Curve" className="md:col-span-2">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">No trades yet</p>
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Equity Curve" className="md:col-span-2">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-full w-full"
      >
        <LineChart data={data} margin={{ left: 8, right: 8, top: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatDateTick}
            minTickGap={40}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={formatCurrencyCompact}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label) =>
                  new Date(label as string).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
            }
          />
          <Line
            dataKey="equity"
            type="monotone"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ChartContainer>
    </DashboardCard>
  )
}
