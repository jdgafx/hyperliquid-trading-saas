import { tradingOverviewData } from "../../_data/trading"

import {
  DashboardCardActionsDropdown,
  DashboardOverviewCardV3,
} from "@/components/dashboards/dashboard-card"
import { NavPerShareChart } from "./nav-per-share-chart"
import { PortfolioValueChart } from "./portfolio-value-chart"
import { UnrealizedPnlChart } from "./unrealized-pnl-chart"
import { VaultEquityChart } from "./vault-equity-chart"

export function TradingOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-full md:grid-cols-4">
      <DashboardOverviewCardV3
        data={{
          value: tradingOverviewData.vaultEquity.value,
          percentageChange: tradingOverviewData.vaultEquity.percentageChange,
        }}
        formatStyle="currency"
        title="Vault Equity"
        action={<DashboardCardActionsDropdown />}
        chart={
          <VaultEquityChart data={tradingOverviewData.vaultEquity.perDay} />
        }
      />
      <DashboardOverviewCardV3
        data={{
          value: tradingOverviewData.navPerShare.value,
          percentageChange: tradingOverviewData.navPerShare.percentageChange,
        }}
        title="NAV Per Share"
        action={<DashboardCardActionsDropdown />}
        chart={
          <NavPerShareChart data={tradingOverviewData.navPerShare.perDay} />
        }
      />
      <DashboardOverviewCardV3
        data={{
          value: tradingOverviewData.portfolioValue.value,
          percentageChange: tradingOverviewData.portfolioValue.percentageChange,
        }}
        formatStyle="currency"
        title="Your Portfolio"
        action={<DashboardCardActionsDropdown />}
        chart={
          <PortfolioValueChart
            data={tradingOverviewData.portfolioValue.perDay}
          />
        }
      />
      <DashboardOverviewCardV3
        data={{
          value: tradingOverviewData.unrealizedPnl.value,
          percentageChange: tradingOverviewData.unrealizedPnl.percentageChange,
        }}
        formatStyle="currency"
        title="Unrealized P&L"
        action={<DashboardCardActionsDropdown />}
        chart={
          <UnrealizedPnlChart data={tradingOverviewData.unrealizedPnl.perDay} />
        }
      />
    </div>
  )
}
