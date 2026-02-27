"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { PerformanceDataPoint } from "../types"

import { useIsRtl } from "@/hooks/use-is-rtl"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function PerformanceChart({ data }: { data: PerformanceDataPoint[] }) {
  const isRtl = useIsRtl()

  return (
    <ChartContainer config={{}} className="aspect-auto h-full w-full">
      <AreaChart
        data={data}
        margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(185 100% 42%)" stopOpacity={0.3} />
            <stop
              offset="50%"
              stopColor="hsl(185 100% 42%)"
              stopOpacity={0.1}
            />
            <stop offset="100%" stopColor="hsl(185 100% 42%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="hsl(220 15% 12%)"
          strokeDasharray="3 6"
        />
        <XAxis
          reversed={isRtl}
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "hsl(215 12% 48%)", fontSize: 11 }}
        />
        <YAxis hide domain={["auto", "auto"]} />
        <ChartTooltip
          cursor={{ stroke: "hsl(185 100% 42% / 0.3)", strokeWidth: 1 }}
          content={<ChartTooltipContent />}
        />
        <Area
          dataKey="equity"
          type="monotone"
          fill="url(#equityGradient)"
          stroke="hsl(185 100% 42%)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
