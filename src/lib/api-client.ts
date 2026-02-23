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

// ── v2 Multi-Strategy Types ──────────────────

export interface StrategyTypeInfo {
  strategy_type: string
  tier: string
  description: string
  default_symbol: string
  default_timeframe: string
  default_params: Record<string, unknown>
}

export interface StrategyRegistryResponse {
  available_strategies: StrategyTypeInfo[]
  total: number
}

export interface StrategyInstanceCreate {
  name: string
  strategy_type: string
  symbol?: string
  timeframe?: string
  leverage?: number
  size_usd?: number
  target_pct?: number
  max_loss_pct?: number
  lookback_days?: number
  interval_seconds?: number
  enabled?: boolean
  params?: Record<string, unknown>
}

export interface StrategyInstance {
  id: number
  name: string
  strategy_type: string
  tier: string
  status: string
  symbol: string
  timeframe: string
  leverage: number
  size_usd: number
  target_pct: number
  max_loss_pct: number
  interval_seconds: number
  enabled: boolean
  params: Record<string, unknown>
  total_trades: number
  winning_trades: number
  losing_trades: number
  total_pnl: number
  max_drawdown: number
  iterations: number
  errors: number
  last_signal: string | null
  last_signal_time: string | null
  started_at: string | null
  error_message: string | null
  created_at: string | null
  updated_at: string | null
}

export interface DashboardStats {
  total_strategies: number
  running_strategies: number
  total_pnl: number
  total_trades: number
  win_rate: number
  vault_equity: number | null
  active_positions: number
}

export interface VaultHistoryPoint {
  date: string
  equity: number
  nav_per_share: number
}

export const api = {
  // ── Vault ──────────────────────────────────
  getVaultStatus: () => fetchAPI<VaultStatus>("/vault/status"),

  // ── Portfolio ──────────────────────────────
  getPortfolio: (userId: number) => fetchAPI<Portfolio>(`/portfolio/${userId}`),

  // ── Positions & Trades ─────────────────────
  getPositions: () => fetchAPI<Position[]>("/positions"),
  getTrades: (limit?: number) =>
    fetchAPI<Trade[]>(`/trades?limit=${limit ?? 50}`),

  // ── Legacy single-strategy endpoints ───────
  getStrategyStatus: () => fetchAPI<StrategyStatus>("/strategy/status"),
  startStrategy: (config: StrategyConfig) =>
    fetchAPI("/strategy/start", {
      method: "POST",
      body: JSON.stringify(config),
    }),
  stopStrategy: () => fetchAPI("/strategy/stop", { method: "POST" }),

  // ── v2 Multi-Strategy endpoints ────────────
  getStrategyRegistry: () =>
    fetchAPI<StrategyRegistryResponse>("/strategies/registry"),
  getStrategies: () => fetchAPI<StrategyInstance[]>("/strategies"),
  createStrategy: (config: StrategyInstanceCreate) =>
    fetchAPI<StrategyInstance>("/strategies", {
      method: "POST",
      body: JSON.stringify(config),
    }),
  startStrategyV2: (name: string) =>
    fetchAPI<{ status: string; name: string }>(
      `/strategies/${encodeURIComponent(name)}/start`,
      {
        method: "POST",
      }
    ),
  stopStrategyV2: (name: string) =>
    fetchAPI<{ status: string; name: string }>(
      `/strategies/${encodeURIComponent(name)}/stop`,
      {
        method: "POST",
      }
    ),

  // ── Dashboard ──────────────────────────────
  getDashboardStats: () => fetchAPI<DashboardStats>("/dashboard/stats"),

  // ── Market Data ────────────────────────────
  getMarketPrice: (symbol: string) =>
    fetchAPI<MarketPrice>(`/market/price/${symbol}`),

  // ── Financial ──────────────────────────────
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
}
