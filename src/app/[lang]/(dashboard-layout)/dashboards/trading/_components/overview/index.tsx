import type { TradingOverviewData } from "../../types"

import {
  DashboardCardActionsDropdown,
  DashboardOverviewCardV3,
} from "@/components/dashboards/dashboard-card"
import { NavPerShareChart } from "./nav-per-share-chart"
import { PortfolioValueChart } from "./portfolio-value-chart"
import { UnrealizedPnlChart } from "./unrealized-pnl-chart"
import { VaultEquityChart } from "./vault-equity-chart"

export function TradingOverview({ data }: { data: TradingOverviewData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-full md:grid-cols-4">
      <DashboardOverviewCardV3
        data={{
          value: data.vaultEquity.value,
          percentageChange: data.vaultEquity.percentageChange,
        }}
        formatStyle="currency"
        title="Vault Equity"
        action={<DashboardCardActionsDropdown />}
        chart={<VaultEquityChart data={data.vaultEquity.perDay} />}
      />
      <DashboardOverviewCardV3
        data={{
          value: data.navPerShare.value,
          percentageChange: data.navPerShare.percentageChange,
        }}
        title="NAV Per Share"
        action={<DashboardCardActionsDropdown />}
        chart={<NavPerShareChart data={data.navPerShare.perDay} />}
      />
      <DashboardOverviewCardV3
        data={{
          value: data.portfolioValue.value,
          percentageChange: data.portfolioValue.percentageChange,
        }}
        formatStyle="currency"
        title="Your Portfolio"
        action={<DashboardCardActionsDropdown />}
        chart={<PortfolioValueChart data={data.portfolioValue.perDay} />}
      />
      <DashboardOverviewCardV3
        data={{
          value: data.unrealizedPnl.value,
          percentageChange: data.unrealizedPnl.percentageChange,
        }}
        formatStyle="currency"
        title="Unrealized P&L"
        action={<DashboardCardActionsDropdown />}
        chart={<UnrealizedPnlChart data={data.unrealizedPnl.perDay} />}
      />
    </div>
  )
}
