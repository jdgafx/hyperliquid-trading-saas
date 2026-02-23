import { performanceData } from "../_data/trading"

import { DashboardCard } from "@/components/dashboards/dashboard-card"
import { PerformanceChart } from "./performance-chart"

export function PortfolioPerformance() {
  return (
    <DashboardCard title="Portfolio Performance" size="default">
      <PerformanceChart data={performanceData} />
    </DashboardCard>
  )
}
