export interface OpenPosition {
  symbol: string
  side: string
  size: number
  entryPrice: number
  markPrice: number
  unrealizedPnl: number
  leverage: number
}

export interface TradeHistory {
  id: number
  symbol: string
  side: string
  size: number
  entryPrice: number
  exitPrice: number
  pnl: number
  exitReason: string
  openedAt: string
  closedAt: string
}

export const openPositionsData: OpenPosition[] = [
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

export const tradeHistoryData: TradeHistory[] = [
  {
    id: 1,
    symbol: "BTC-PERP",
    side: "long",
    size: 0.05,
    entryPrice: 67420,
    exitPrice: 70270,
    pnl: 142.5,
    exitReason: "take_profit",
    openedAt: "2024-03-01 08:30",
    closedAt: "2024-03-02 14:15",
  },
  {
    id: 2,
    symbol: "ETH-PERP",
    side: "short",
    size: 0.8,
    entryPrice: 3280,
    exitPrice: 3322.75,
    pnl: -34.2,
    exitReason: "stop_loss",
    openedAt: "2024-03-03 10:00",
    closedAt: "2024-03-03 16:45",
  },
  {
    id: 3,
    symbol: "SOL-PERP",
    side: "long",
    size: 5.0,
    entryPrice: 182.4,
    exitPrice: 188.15,
    pnl: 28.75,
    exitReason: "signal",
    openedAt: "2024-03-04 09:00",
    closedAt: "2024-03-05 11:30",
  },
  {
    id: 4,
    symbol: "BTC-PERP",
    side: "long",
    size: 0.02,
    entryPrice: 64200,
    exitPrice: 65500,
    pnl: 26.0,
    exitReason: "take_profit",
    openedAt: "2024-03-06 07:00",
    closedAt: "2024-03-07 13:00",
  },
  {
    id: 5,
    symbol: "ETH-PERP",
    side: "long",
    size: 1.0,
    entryPrice: 3190,
    exitPrice: 3160,
    pnl: -30.0,
    exitReason: "stop_loss",
    openedAt: "2024-03-08 08:00",
    closedAt: "2024-03-08 12:00",
  },
]
