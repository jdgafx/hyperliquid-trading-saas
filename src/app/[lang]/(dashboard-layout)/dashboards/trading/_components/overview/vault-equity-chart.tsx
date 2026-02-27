"use client"

import { Area, AreaChart } from "recharts"

import type { TradingMetric } from "../../types"

import { ChartContainer } from "@/components/ui/chart"

export function VaultEquityChart({ data }: { data: TradingMetric["perDay"] }) {
  return (
    <ChartContainer
      config={{}}
      className="h-32 w-full rounded-b-md overflow-hidden"
    >
      <AreaChart data={data} margin={{ left: 0, right: 0 }}>
        <defs>
          <linearGradient id="sparkGrad-vault" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--chart-1))"
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--chart-1))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="value"
          type="monotone"
          fill="url(#sparkGrad-vault)"
          stroke="hsl(var(--chart-1))"
          strokeWidth={1.5}
        />
      </AreaChart>
    </ChartContainer>
  )
}
