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

export interface ApiKeyTestResult {
  valid: boolean
  address: string
}

export interface ApiKeySaveResult {
  status: string
}

export interface ApiKeyStatus {
  connected: boolean
  address: string | null
}

// ── Risk Types ────────────────────────────────
export interface RiskConfig {
  max_daily_loss_pct: number
  max_leverage: number
  max_margin_pct: number
  stop_loss_pct: number
  take_profit_pct: number
  trailing_stop_pct: number | null
  anti_tilt_lockout_hours: number
  liquidation_pause_threshold: number
  auto_withdraw_on_max_loss: boolean
  check_interval_seconds: number
}

export interface RiskSnapshot {
  status: string
  account_value: number
  daily_pnl: number
  daily_pnl_pct: number
  start_of_day_equity: number
  total_margin_used: number
  margin_usage_pct: number
  max_position_leverage: number
  open_positions: number
  lockout_until: string | null
  last_check: string | null
}

export interface RiskEvent {
  id: number
  event_type: string
  severity: string
  message: string
  details: Record<string, unknown> | null
  timestamp: string
}

export interface RiskStatus {
  config: RiskConfig
  snapshot: RiskSnapshot
  recent_events: RiskEvent[]
}

// ── Liquidation Types ────────────────────────
export interface NearLiquidation {
  address: string
  symbol: string
  side: string
  size_usd: number
  leverage: number
  liquidation_price: number
  mark_price: number
  distance_pct: number
}

export interface LiquidationHeatmapLevel {
  price_level: number
  total_long_liq_usd: number
  total_short_liq_usd: number
  position_count: number
}

export interface LiquidationVolume {
  window: string
  total_liquidated_usd: number
  long_liquidated_usd: number
  short_liquidated_usd: number
  event_count: number
}

export interface SafetyStatus {
  is_safe_to_trade: boolean
  recent_liquidation_volume: number
  threshold: number
  message: string
}

// ── Whale Types ──────────────────────────────
export interface WhalePosition {
  symbol: string
  side: string
  size_usd: number
  entry_price: number
  mark_price: number
  unrealized_pnl: number
  leverage: number
  liquidation_price: number | null
  distance_to_liq_pct: number | null
}

export interface WhaleInfo {
  address: string
  label: string | null
  tags: string[]
  total_deposit: number
  current_equity: number
  pnl: number
  pnl_pct: number
  positions: WhalePosition[]
  is_blown_up: boolean
  alert_enabled: boolean
}

export interface WhaleStats {
  total_tracked: number
  blown_up_count: number
  blown_up_pct: number
  total_whale_equity: number
  avg_leverage: number
  top_profitable_count: number
}

// ── Backtest Types ───────────────────────────
export interface BacktestConfig {
  strategy_type: string
  symbol: string
  timeframe: string
  lookback_days: number
  initial_capital: number
  commission_pct: number
  leverage: number
  params: Record<string, unknown>
}

export interface BacktestMetrics {
  total_return_pct: number
  sharpe_ratio: number
  sortino_ratio: number
  calmar_ratio: number
  max_drawdown_pct: number
  avg_drawdown_pct: number
  profit_factor: number
  expectancy: number
  win_rate: number
  total_trades: number
  exposure_time_pct: number
  avg_trade_pct: number
}

export interface BacktestResult {
  id: number
  config: BacktestConfig
  metrics: BacktestMetrics
  equity_curve: { timestamp: string; equity: number }[]
  trades: {
    entry_time: string
    exit_time: string
    side: string
    entry_price: number
    exit_price: number
    pnl_pct: number
    pnl_usd: number
  }[]
  status: string
  error: string | null
}

export interface BacktestSummary {
  id: number
  strategy_type: string
  symbol: string
  timeframe: string
  total_return_pct: number
  sharpe_ratio: number
  max_drawdown_pct: number
  win_rate: number
  total_trades: number
  status: string
}

// ── RBI Types ────────────────────────────────
export interface RBIJob {
  id: number
  status: string
  input_type: string
  input_text: string
  progress_pct: number
  progress_message: string
  strategies_found: number
  error_message: string | null
  ai_provider: string
  created_at: string | null
  updated_at: string | null
}

export interface RBIStrategyResult {
  id: number
  job_id: number
  strategy_name: string
  description: string | null
  symbol: string
  timeframe: string
  total_return_pct: number | null
  sharpe_ratio: number | null
  sortino_ratio: number | null
  max_drawdown_pct: number | null
  profit_factor: number | null
  win_rate: number | null
  total_trades: number | null
  is_optimized: string
  rank: number | null
}

export interface RBIJobResults {
  job: RBIJob
  results: RBIStrategyResult[]
}

// ── Regime Types ─────────────────────────────
export interface RegimeInfo {
  symbol: string
  current_regime: string
  confidence: number
  duration_hours: number
  recommended_strategies: string[]
  avoid_strategies: string[]
}

export interface VolatilityStatus {
  symbol: string
  is_volatile: boolean
  atr_value: number
  atr_percentile: number
  volatility_regime: string
  message: string
}

// ── Fee Calculator Types ─────────────────────
export interface FeeCalculatorInput {
  account_balance: number
  avg_trades_per_day: number
  avg_position_size: number
  maker_ratio: number
  maker_fee_bps: number
  taker_fee_bps: number
}

export interface FeeCalculatorOutput {
  daily_fee_cost: number
  weekly_fee_cost: number
  monthly_fee_cost: number
  yearly_fee_cost: number
  fee_pct_of_balance_daily: number
  fee_pct_of_balance_monthly: number
  days_until_10pct_eaten: number | null
  days_until_25pct_eaten: number | null
  days_until_50pct_eaten: number | null
  days_until_100pct_eaten: number | null
  avg_fee_per_trade: number
  blended_fee_bps: number
  warning: string | null
}

export const api = {
  // ── API Key Management ───────────────────────
  testApiKey: (apiKey: string, apiSecret: string) =>
    fetchAPI<ApiKeyTestResult>("/api-keys/test", {
      method: "POST",
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret }),
    }),
  saveApiKey: (apiKey: string, apiSecret: string) =>
    fetchAPI<ApiKeySaveResult>("/api-keys/save", {
      method: "POST",
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret }),
    }),
  getApiKeyStatus: () => fetchAPI<ApiKeyStatus>("/api-keys/status"),

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

  // ── Trading Mode ─────────────────────────────
  getTradingMode: () =>
    fetchAPI<{
      mode: string
      available_modes: string[]
      stats?: Record<string, unknown>
    }>("/trading-mode"),
  setTradingMode: (mode: string) =>
    fetchAPI<{
      status: string
      mode: string
      previous_mode: string
      message: string
    }>("/trading-mode", {
      method: "POST",
      body: JSON.stringify({ mode }),
    }),

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

  // ── Risk Controller ──────────────────────────
  getRiskConfig: () => fetchAPI<RiskConfig>("/risk/config"),
  updateRiskConfig: (config: Partial<RiskConfig>) =>
    fetchAPI<RiskConfig>("/risk/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),
  startRiskMonitoring: () =>
    fetchAPI<{ status: string }>("/risk/start", { method: "POST" }),
  stopRiskMonitoring: () =>
    fetchAPI<{ status: string }>("/risk/stop", { method: "POST" }),
  getRiskStatus: () => fetchAPI<RiskStatus>("/risk/status"),
  getRiskEvents: (limit?: number) =>
    fetchAPI<RiskEvent[]>(`/risk/events?limit=${limit ?? 100}`),
  calculateFees: (input: FeeCalculatorInput) =>
    fetchAPI<FeeCalculatorOutput>("/tools/fee-calculator", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  // ── Liquidations ─────────────────────────────
  getNearLiquidations: (symbol?: string, maxDistance?: number) =>
    fetchAPI<NearLiquidation[]>(
      `/liquidations/near?max_distance_pct=${maxDistance ?? 5}${symbol ? `&symbol=${symbol}` : ""}`
    ),
  getLiquidationHeatmap: (symbol: string = "BTC", levels: number = 20) =>
    fetchAPI<LiquidationHeatmapLevel[]>(
      `/liquidations/heatmap?symbol=${symbol}&levels=${levels}`
    ),
  getLiquidationVolume: () =>
    fetchAPI<LiquidationVolume[]>("/liquidations/volume"),
  getSafetyStatus: () => fetchAPI<SafetyStatus>("/liquidations/threshold"),

  // ── Whales ───────────────────────────────────
  getWhales: (sortBy?: string, limit?: number) =>
    fetchAPI<WhaleInfo[]>(
      `/whales?sort_by=${sortBy ?? "equity"}&limit=${limit ?? 50}`
    ),
  getWhaleStats: () => fetchAPI<WhaleStats>("/whales/stats"),
  getWhale: (address: string) => fetchAPI<WhaleInfo>(`/whales/${address}`),
  updateWhaleLabel: (address: string, label: string | null, tags?: string[]) =>
    fetchAPI(`/whales/${address}/label`, {
      method: "PUT",
      body: JSON.stringify({ label, tags }),
    }),
  toggleWhaleAlert: (address: string, enabled: boolean) =>
    fetchAPI(`/whales/${address}/alert`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),

  // ── Backtesting ──────────────────────────────
  runBacktest: (config: Partial<BacktestConfig>) =>
    fetchAPI<BacktestResult>("/backtest/run", {
      method: "POST",
      body: JSON.stringify(config),
    }),
  getBacktestResult: (id: number) =>
    fetchAPI<BacktestResult>(`/backtest/results/${id}`),
  getBacktestHistory: (limit?: number) =>
    fetchAPI<BacktestSummary[]>(`/backtest/history?limit=${limit ?? 50}`),
  runMultiBacktest: (config: {
    strategy_type: string
    symbols?: string[]
    timeframes?: string[]
  }) =>
    fetchAPI<BacktestSummary[]>("/backtest/multi", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  // ── RBI Agent ────────────────────────────────
  createRBIJob: (input_text: string, input_type: string = "text") =>
    fetchAPI<RBIJob>("/rbi/jobs", {
      method: "POST",
      body: JSON.stringify({ input_text, input_type }),
    }),
  getRBIJobs: (limit?: number) =>
    fetchAPI<RBIJob[]>(`/rbi/jobs?limit=${limit ?? 20}`),
  getRBIJob: (jobId: number) => fetchAPI<RBIJob>(`/rbi/jobs/${jobId}`),
  getRBIResults: (jobId: number, sortBy?: string) =>
    fetchAPI<RBIJobResults>(
      `/rbi/jobs/${jobId}/results?sort_by=${sortBy ?? "sharpe_ratio"}`
    ),
  deployRBIStrategy: (
    jobId: number,
    resultId: number,
    symbol?: string,
    sizeUsd?: number
  ) =>
    fetchAPI(`/rbi/jobs/${jobId}/deploy`, {
      method: "POST",
      body: JSON.stringify({
        result_id: resultId,
        symbol: symbol ?? "BTC",
        size_usd: sizeUsd ?? 100,
      }),
    }),

  // ── Regime Detection ─────────────────────────
  getCurrentRegimes: (symbols: string = "BTC,ETH,SOL") =>
    fetchAPI<RegimeInfo[]>(`/regime/current?symbols=${symbols}`),
  getRegimeHistory: (symbol: string = "BTC", limit?: number) =>
    fetchAPI<
      {
        symbol: string
        from_regime: string
        to_regime: string
        timestamp: string
      }[]
    >(`/regime/history?symbol=${symbol}&limit=${limit ?? 50}`),
  getVolatilityStatus: (symbols: string = "BTC,ETH,SOL") =>
    fetchAPI<VolatilityStatus[]>(`/regime/volatility?symbols=${symbols}`),

  // ── Billing ──────────────────────────────────
  getBillingTiers: () =>
    fetchAPI<{
      tiers: { tier: string; max_strategies: number; price_monthly: number }[]
    }>("/billing/tiers"),
  getSubscription: (userId: number) =>
    fetchAPI<{ tier: string; limits: Record<string, unknown> }>(
      `/billing/subscription/${userId}`
    ),
}
