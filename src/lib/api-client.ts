const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export interface VaultStatus {
  total_equity: number
  total_shares: number
  nav_per_share: number
  live_equity: number | null
}

export interface Portfolio {
  user_id: number
  username: string
  shares: number
  nav_per_share: number
  portfolio_value: number
  total_deposited: number
  unrealized_pnl: number
  pnl_percent: number
}

export interface Position {
  symbol: string
  size: number
  side: string
  entry_price: number
  mark_price: number
  unrealized_pnl: number
  leverage: number
}

export interface Trade {
  id: number
  symbol: string
  side: string
  size: number
  entry_price: number
  exit_price: number | null
  pnl: number | null
  exit_reason: string | null
  strategy: string
  opened_at: string
  closed_at: string | null
  is_open: boolean
}

export interface StrategyStatus {
  name: string
  status: string
  symbol: string
  timeframe: string
  lookback_period: number
  atr_period: number
  atr_multiplier: number
  leverage: number
  last_signal: string | null
  last_signal_time: string | null
}

export interface StrategyConfig {
  symbol: string
  timeframe: string
  lookback_period: number
  atr_period: number
  atr_multiplier: number
  leverage: number
}

export interface MarketPrice {
  symbol: string
  price: number
  funding_rate: number
}

export interface User {
  user_id: number
  username: string
  shares: number
  portfolio_value: number
}

export interface Withdrawal {
  user_id: number
  shares_redeemed: number
  usdc_received: number
}

export const api = {
  getVaultStatus: () => fetchAPI<VaultStatus>("/vault/status"),
  getPortfolio: (userId: number) => fetchAPI<Portfolio>(`/portfolio/${userId}`),
  getPositions: () => fetchAPI<Position[]>("/positions"),
  getTrades: (limit?: number) =>
    fetchAPI<Trade[]>(`/trades?limit=${limit ?? 50}`),
  getStrategyStatus: () => fetchAPI<StrategyStatus>("/strategy/status"),
  deposit: (userId: number, amount: number) =>
    fetchAPI<User>("/deposit", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, amount }),
    }),
  withdraw: (userId: number, shares: number) =>
    fetchAPI<Withdrawal>("/withdraw", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, shares_to_redeem: shares }),
    }),
  startStrategy: (config: StrategyConfig) =>
    fetchAPI("/strategy/start", {
      method: "POST",
      body: JSON.stringify(config),
    }),
  stopStrategy: () => fetchAPI("/strategy/stop", { method: "POST" }),
  getMarketPrice: (symbol: string) =>
    fetchAPI<MarketPrice>(`/market/price/${symbol}`),
}
