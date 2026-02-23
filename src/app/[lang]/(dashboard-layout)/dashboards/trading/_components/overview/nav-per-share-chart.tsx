"use client"

import { Area, AreaChart } from "recharts"

import type { TradingMetric } from "../../types"

import { ChartContainer } from "@/components/ui/chart"

export function NavPerShareChart({ data }: { data: TradingMetric["perDay"] }) {
  return (
    <ChartContainer
      config={{}}
      className="h-32 w-full rounded-b-md overflow-hidden"
    >
      <AreaChart data={data} margin={{ left: 0, right: 0 }}>
        <Area
          dataKey="value"
          type="natural"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.4}
          stroke="hsl(var(--chart-1))"
        />
      </AreaChart>
    </ChartContainer>
  )
}
