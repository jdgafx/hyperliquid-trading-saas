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

export const vaultStatusData: VaultStatusData = {
  totalEquity: 142580.5,
  totalShares: 131700,
  navPerShare: 1.0826,
  liveEquity: 142650.0,
}

export const userSharesData: UserSharesData = {
  shares: 501.84,
  portfolioValue: 543.2,
  totalDeposited: 500.0,
  unrealizedPnl: 43.2,
  pnlPercent: 0.0864,
}

export const depositHistoryData: DepositHistoryItem[] = [
  {
    id: 1,
    amount: 250.0,
    sharesReceived: 243.9,
    date: "2024-01-15",
    txHash: "0x1a2b...3c4d",
  },
  {
    id: 2,
    amount: 250.0,
    sharesReceived: 247.28,
    date: "2024-02-01",
    txHash: "0x5e6f...7a8b",
  },
  {
    id: 3,
    amount: 100.0,
    sharesReceived: 97.35,
    date: "2024-02-15",
    txHash: "0x9c0d...1e2f",
  },
]
