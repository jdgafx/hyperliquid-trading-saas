import { LineChart as LineChartIcon } from "lucide-react"

import type { PerformanceDataPoint } from "../types"

import { Card } from "@/components/ui/card"
import { PerformanceChart } from "./performance-chart"

export function PortfolioPerformance({
  data,
}: {
  data: PerformanceDataPoint[]
}) {
  return (
    <Card className="h-full overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <LineChartIcon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Portfolio Performance
        </h3>
      </div>
      <div className="p-4">
        <div className="h-72">
          <PerformanceChart data={data} />
        </div>
      </div>
    </Card>
  )
}
