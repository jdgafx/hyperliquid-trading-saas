import type { PerformanceDataPoint } from "../types"

import { DashboardCard } from "@/components/dashboards/dashboard-card"
import { PerformanceChart } from "./performance-chart"

export function PortfolioPerformance({
  data,
}: {
  data: PerformanceDataPoint[]
}) {
  return (
    <DashboardCard title="Portfolio Performance" size="default">
      <PerformanceChart data={data} />
    </DashboardCard>
  )
}
