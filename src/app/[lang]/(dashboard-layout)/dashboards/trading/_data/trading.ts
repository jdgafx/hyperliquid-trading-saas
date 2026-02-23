import type {
  ActivePosition,
  PerformanceDataPoint,
  RecentTrade,
  TradingOverviewData,
} from "../types"

export const tradingOverviewData: TradingOverviewData = {
  vaultEquity: {
    value: 142580.5,
    percentageChange: 0.0312,
    perDay: [
      { day: "Mon", value: 138000 },
      { day: "Tue", value: 139500 },
      { day: "Wed", value: 141200 },
      { day: "Thu", value: 140800 },
      { day: "Fri", value: 142580 },
      { day: "Sat", value: 143000 },
      { day: "Sun", value: 142580 },
    ],
  },
  navPerShare: {
    value: 1.0826,
    percentageChange: 0.0082,
    perDay: [
      { day: "Mon", value: 1.074 },
      { day: "Tue", value: 1.076 },
      { day: "Wed", value: 1.079 },
      { day: "Thu", value: 1.081 },
      { day: "Fri", value: 1.0826 },
      { day: "Sat", value: 1.083 },
      { day: "Sun", value: 1.0826 },
    ],
  },
  portfolioValue: {
    value: 543.2,
    percentageChange: 0.0082,
    perDay: [
      { day: "Mon", value: 538 },
      { day: "Tue", value: 539 },
      { day: "Wed", value: 540 },
      { day: "Thu", value: 541 },
      { day: "Fri", value: 543.2 },
      { day: "Sat", value: 543.8 },
      { day: "Sun", value: 543.2 },
    ],
  },
  unrealizedPnl: {
    value: 43.2,
    percentageChange: 0.0864,
    perDay: [
      { day: "Mon", value: 38 },
      { day: "Tue", value: 39 },
      { day: "Wed", value: 40 },
      { day: "Thu", value: 41 },
      { day: "Fri", value: 43.2 },
      { day: "Sat", value: 43.8 },
      { day: "Sun", value: 43.2 },
    ],
  },
}

export const recentTradesData: RecentTrade[] = [
  {
    id: 1,
    symbol: "BTC-PERP",
    side: "long",
    size: 0.05,
    entryPrice: 67420,
    pnl: 142.5,
    status: "closed",
  },
  {
    id: 2,
    symbol: "ETH-PERP",
    side: "short",
    size: 0.8,
    entryPrice: 3280,
    pnl: -34.2,
    status: "closed",
  },
  {
    id: 3,
    symbol: "BTC-PERP",
    side: "long",
    size: 0.03,
    entryPrice: 68100,
    pnl: null,
    status: "open",
  },
  {
    id: 4,
    symbol: "SOL-PERP",
    side: "long",
    size: 5.0,
    entryPrice: 182.4,
    pnl: 28.75,
    status: "closed",
  },
  {
    id: 5,
    symbol: "ETH-PERP",
    side: "long",
    size: 0.5,
    entryPrice: 3310,
    pnl: null,
    status: "open",
  },
]

export const activePositionsData: ActivePosition[] = [
  {
    symbol: "BTC-PERP",
    side: "long",
    size: 0.03,
    entryPrice: 68100,
    markPrice: 68740,
    unrealizedPnl: 19.2,
    leverage: 3,
  },
  {
    symbol: "ETH-PERP",
    side: "long",
    size: 0.5,
    entryPrice: 3310,
    markPrice: 3348,
    unrealizedPnl: 19.0,
    leverage: 2,
  },
]

export const performanceData: PerformanceDataPoint[] = [
  { date: "Jan 1", equity: 131000 },
  { date: "Jan 8", equity: 132800 },
  { date: "Jan 15", equity: 130500 },
  { date: "Jan 22", equity: 134200 },
  { date: "Feb 1", equity: 135800 },
  { date: "Feb 8", equity: 137100 },
  { date: "Feb 15", equity: 136400 },
  { date: "Feb 22", equity: 139200 },
  { date: "Mar 1", equity: 140800 },
  { date: "Mar 8", equity: 142580 },
]
