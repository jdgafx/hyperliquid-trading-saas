export interface VaultStatusData {
  totalEquity: number
  totalShares: number
  navPerShare: number
  liveEquity: number
}

export interface UserSharesData {
  shares: number
  portfolioValue: number
  totalDeposited: number
  unrealizedPnl: number
  pnlPercent: number
}

export interface DepositHistoryItem {
  id: number
  amount: number
  sharesReceived: number
  date: string
  txHash: string
}
