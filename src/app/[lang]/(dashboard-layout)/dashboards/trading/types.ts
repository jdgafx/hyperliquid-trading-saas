export interface TradingMetric {
  value: number
  percentageChange: number
  perDay: Array<{ day: string; value: number }>
}

export interface TradingOverviewData {
  vaultEquity: TradingMetric
  navPerShare: TradingMetric
  portfolioValue: TradingMetric
  unrealizedPnl: TradingMetric
}

export interface RecentTrade {
  id: number
  symbol: string
  side: string
  size: number
  entryPrice: number
  pnl: number | null
  status: "open" | "closed"
}

export interface ActivePosition {
  symbol: string
  side: string
  size: number
  entryPrice: number
  markPrice: number
  unrealizedPnl: number
  leverage: number
}

export interface PerformanceDataPoint {
  date: string
  equity: number
}
