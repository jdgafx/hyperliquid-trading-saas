import {
  ArrowUpDown,
  BarChart3,
  Bot,
  Target,
  TrendingUp,
  Vault,
  Wallet,
} from "lucide-react"

import type { DashboardStats } from "@/lib/api-client"
import type { TradingOverviewData } from "../../types"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"
import { NavPerShareChart } from "./nav-per-share-chart"
import { PortfolioValueChart } from "./portfolio-value-chart"
import { UnrealizedPnlChart } from "./unrealized-pnl-chart"
import { VaultEquityChart } from "./vault-equity-chart"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value)
}

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ElementType
  chart: React.ReactNode
  variant?: "default" | "profit" | "loss"
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  chart,
  variant = "default",
}: MetricCardProps) {
  const isPositive = change >= 0

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)]">
      {/* Subtle top accent line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px transition-opacity duration-300",
          variant === "profit" &&
            "bg-gradient-to-r from-transparent via-success to-transparent opacity-60",
          variant === "loss" &&
            "bg-gradient-to-r from-transparent via-destructive to-transparent opacity-60",
          variant === "default" &&
            "bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {title}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-medium font-data",
              isPositive
                ? "text-success glow-profit"
                : "text-destructive glow-loss"
            )}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        </div>

        <p
          className={cn(
            "mt-2 text-2xl font-semibold tracking-tight font-data",
            variant === "profit" && "text-success",
            variant === "loss" && "text-destructive"
          )}
        >
          {value}
        </p>
      </div>

      {/* Sparkline chart area */}
      <div className="mt-3 overflow-hidden rounded-b-lg opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        {chart}
      </div>
    </Card>
  )
}

interface QuickStatProps {
  label: string
  value: string | number
  icon: React.ElementType
  valueColor?: string
}

function QuickStat({ label, value, icon: Icon, valueColor }: QuickStatProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/60 px-3 py-2 backdrop-blur-sm">
      <Icon className="size-3.5 text-muted-foreground" />
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-sm font-bold font-data", valueColor)}>{value}</p>
      </div>
    </div>
  )
}

interface TradingOverviewProps {
  data: TradingOverviewData
  stats?: DashboardStats | null
}

export function TradingOverview({ data, stats }: TradingOverviewProps) {
  const unrealizedVariant = data.unrealizedPnl.value >= 0 ? "profit" : "loss"

  return (
    <div className="space-y-3">
      {/* Main metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Vault Equity"
          value={formatCurrency(data.vaultEquity.value)}
          change={data.vaultEquity.percentageChange}
          icon={Vault}
          chart={<VaultEquityChart data={data.vaultEquity.perDay} />}
        />
        <MetricCard
          title="NAV / Share"
          value={formatNumber(data.navPerShare.value)}
          change={data.navPerShare.percentageChange}
          icon={TrendingUp}
          chart={<NavPerShareChart data={data.navPerShare.perDay} />}
        />
        <MetricCard
          title="Portfolio"
          value={formatCurrency(data.portfolioValue.value)}
          change={data.portfolioValue.percentageChange}
          icon={Wallet}
          chart={<PortfolioValueChart data={data.portfolioValue.perDay} />}
        />
        <MetricCard
          title="Unrealized P&L"
          value={formatCurrency(data.unrealizedPnl.value)}
          change={data.unrealizedPnl.percentageChange}
          icon={ArrowUpDown}
          chart={<UnrealizedPnlChart data={data.unrealizedPnl.perDay} />}
          variant={unrealizedVariant}
        />
      </div>

      {/* Quick stats row (from dashboard API) */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <QuickStat
            label="Strategies"
            value={`${stats.running_strategies}/${stats.total_strategies}`}
            icon={Bot}
            valueColor="text-primary"
          />
          <QuickStat
            label="Total Trades"
            value={stats.total_trades}
            icon={BarChart3}
          />
          <QuickStat
            label="Win Rate"
            value={`${(stats.win_rate * 100).toFixed(1)}%`}
            icon={Target}
            valueColor={
              stats.win_rate >= 0.5 ? "text-success" : "text-destructive"
            }
          />
          <QuickStat
            label="Total P&L"
            value={formatCurrency(stats.total_pnl)}
            icon={TrendingUp}
            valueColor={
              stats.total_pnl > 0
                ? "text-success"
                : stats.total_pnl < 0
                  ? "text-destructive"
                  : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
