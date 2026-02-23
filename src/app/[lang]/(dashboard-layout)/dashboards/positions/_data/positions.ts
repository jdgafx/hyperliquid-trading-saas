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
