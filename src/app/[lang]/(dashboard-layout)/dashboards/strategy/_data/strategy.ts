import type { StrategyTypeInfo } from "@/lib/api-client"

export type StrategyTier = "A" | "B" | "C"
export type StrategyCategory =
  | "trend"
  | "mean-reversion"
  | "market-making"
  | "statistical"
  | "arbitrage"

export interface ParamDef {
  label: string
  default: number | string
  type: "number" | "select"
  min?: number
  max?: number
  step?: number
  options?: string[]
}

export interface StrategyDefinition {
  id: string
  name: string
  description: string
  tier: StrategyTier
  category: StrategyCategory
  status: "live" | "coming-soon"
  riskLevel: "low" | "medium" | "high"
  defaultSymbol: string
  defaultTimeframe: string
  params: Record<string, ParamDef>
}

/** Maps backend strategy_type to display metadata */
const STRATEGY_META: Record<
  string,
  {
    name: string
    category: StrategyCategory
    riskLevel: "low" | "medium" | "high"
  }
> = {
  turtle: { name: "Turtle Trending", category: "trend", riskLevel: "medium" },
  bollinger: {
    name: "Bollinger Squeeze",
    category: "trend",
    riskLevel: "medium",
  },
  supply_demand_zone: {
    name: "Supply/Demand Zone",
    category: "mean-reversion",
    riskLevel: "high",
  },
  vwap_bot: {
    name: "VWAP Probability",
    category: "statistical",
    riskLevel: "medium",
  },
  funding_arb: { name: "Funding Arb", category: "arbitrage", riskLevel: "low" },
  correlation: {
    name: "Correlation",
    category: "statistical",
    riskLevel: "medium",
  },
  consolidation_pop: {
    name: "Consolidation Pop",
    category: "trend",
    riskLevel: "high",
  },
  nadaraya_watson: {
    name: "Nadaraya-Watson",
    category: "mean-reversion",
    riskLevel: "medium",
  },
  market_maker: {
    name: "Market Maker",
    category: "market-making",
    riskLevel: "low",
  },
  mean_reversion: {
    name: "Mean Reversion",
    category: "mean-reversion",
    riskLevel: "medium",
  },
  sma_crossover: { name: "SMA Crossover", category: "trend", riskLevel: "low" },
  rsi: {
    name: "RSI Reversal",
    category: "mean-reversion",
    riskLevel: "medium",
  },
  vwma: { name: "VWMA Alignment", category: "trend", riskLevel: "medium" },
}

/**
 * Convert a backend StrategyTypeInfo into a StrategyDefinition for the UI.
 */
export function toStrategyDefinition(
  info: StrategyTypeInfo
): StrategyDefinition {
  const meta = STRATEGY_META[info.strategy_type] ?? {
    name: info.strategy_type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "statistical" as StrategyCategory,
    riskLevel: "medium" as const,
  }

  const tier = (info.tier?.toUpperCase() ?? "C") as StrategyTier

  // Build param defs from default_params
  const params: Record<string, ParamDef> = {}
  for (const [key, value] of Object.entries(info.default_params ?? {})) {
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
    if (typeof value === "number") {
      params[key] = {
        label,
        default: value,
        type: "number",
        step: value < 1 ? 0.001 : value < 10 ? 0.1 : 1,
      }
    } else {
      params[key] = { label, default: String(value), type: "number" }
    }
  }

  return {
    id: info.strategy_type,
    name: meta.name,
    description: info.description,
    tier,
    category: meta.category,
    status: "live",
    riskLevel: meta.riskLevel,
    defaultSymbol: info.default_symbol,
    defaultTimeframe: info.default_timeframe,
    params,
  }
}

/**
 * Hardcoded fallback — used when the API is unreachable.
 * Covers all 13 strategies from the backend registry.
 */
export const fallbackStrategies: StrategyDefinition[] = [
  {
    id: "turtle",
    name: "Turtle Trending",
    tier: "A",
    category: "trend",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "BTC",
    defaultTimeframe: "1h",
    description: "55-bar breakout with ATR trailing stops and take profit",
    params: {
      lookback_period: {
        label: "Lookback Period",
        default: 55,
        type: "number",
        min: 10,
        max: 200,
      },
      atr_period: {
        label: "ATR Period",
        default: 20,
        type: "number",
        min: 5,
        max: 50,
      },
      atr_multiplier: {
        label: "ATR Multiplier",
        default: 2.0,
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      take_profit_pct: {
        label: "Take Profit %",
        default: 0.002,
        type: "number",
        min: 0.001,
        max: 0.05,
        step: 0.001,
      },
    },
  },
  {
    id: "bollinger",
    name: "Bollinger Squeeze",
    tier: "A",
    category: "trend",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "BTC",
    defaultTimeframe: "1h",
    description: "Bollinger Band squeeze breakout with band-width triggers",
    params: {
      bb_period: {
        label: "BB Period",
        default: 20,
        type: "number",
        min: 5,
        max: 50,
      },
      bb_std: {
        label: "BB Std Dev",
        default: 2.0,
        type: "number",
        min: 1,
        max: 4,
        step: 0.1,
      },
      squeeze_threshold: {
        label: "Squeeze Threshold",
        default: 0.03,
        type: "number",
        min: 0.01,
        max: 0.1,
        step: 0.005,
      },
    },
  },
  {
    id: "supply_demand_zone",
    name: "Supply/Demand Zone",
    tier: "A",
    category: "mean-reversion",
    status: "live",
    riskLevel: "high",
    defaultSymbol: "BTC",
    defaultTimeframe: "4h",
    description: "Supply/Demand zone detection with reversal entries",
    params: {
      zone_lookback_days: {
        label: "Zone Lookback Days",
        default: 30,
        type: "number",
        min: 5,
        max: 90,
      },
      zone_threshold: {
        label: "Zone Threshold",
        default: 0.02,
        type: "number",
        min: 0.005,
        max: 0.1,
        step: 0.005,
      },
    },
  },
  {
    id: "vwap_bot",
    name: "VWAP Probability",
    tier: "A",
    category: "statistical",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "BTC",
    defaultTimeframe: "15m",
    description: "VWAP-based probability bias trading (70/30 above/below)",
    params: {
      vwap_bias_long: {
        label: "Long Bias",
        default: 0.7,
        type: "number",
        min: 0.5,
        max: 1,
        step: 0.05,
      },
      vwap_bias_short: {
        label: "Short Bias",
        default: 0.3,
        type: "number",
        min: 0,
        max: 0.5,
        step: 0.05,
      },
    },
  },
  {
    id: "funding_arb",
    name: "Funding Arb",
    tier: "A",
    category: "arbitrage",
    status: "live",
    riskLevel: "low",
    defaultSymbol: "BTC",
    defaultTimeframe: "1h",
    description: "Funding rate arbitrage between correlated assets (BTC/ETH)",
    params: {
      symbol_a: { label: "Symbol A", default: "BTC", type: "number" },
      symbol_b: { label: "Symbol B", default: "ETH", type: "number" },
      funding_threshold: {
        label: "Funding Threshold",
        default: 0.0005,
        type: "number",
        min: 0.0001,
        max: 0.005,
        step: 0.0001,
      },
      combined_target_pct: {
        label: "Combined Target %",
        default: 3.0,
        type: "number",
        min: 0.5,
        max: 10,
        step: 0.5,
      },
    },
  },
  {
    id: "correlation",
    name: "Correlation",
    tier: "B",
    category: "statistical",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "SOL",
    defaultTimeframe: "15m",
    description: "Leader/follower correlation trading (ETH leads altcoins)",
    params: {
      leader: { label: "Leader", default: "ETH", type: "number" },
      correlation_window: {
        label: "Correlation Window",
        default: 20,
        type: "number",
        min: 5,
        max: 100,
      },
      lag_threshold: {
        label: "Lag Threshold",
        default: 0.002,
        type: "number",
        min: 0.001,
        max: 0.01,
        step: 0.001,
      },
    },
  },
  {
    id: "consolidation_pop",
    name: "Consolidation Pop",
    tier: "B",
    category: "trend",
    status: "live",
    riskLevel: "high",
    defaultSymbol: "BTC",
    defaultTimeframe: "15m",
    description: "Consolidation detection via ATR deviance, range breakout",
    params: {
      atr_period: {
        label: "ATR Period",
        default: 14,
        type: "number",
        min: 5,
        max: 50,
      },
      deviance_threshold: {
        label: "Deviance Threshold",
        default: 0.4,
        type: "number",
        min: 0.1,
        max: 1,
        step: 0.05,
      },
      tp_pct: {
        label: "Take Profit %",
        default: 0.003,
        type: "number",
        min: 0.001,
        max: 0.01,
        step: 0.001,
      },
      sl_pct: {
        label: "Stop Loss %",
        default: 0.0025,
        type: "number",
        min: 0.001,
        max: 0.01,
        step: 0.001,
      },
    },
  },
  {
    id: "nadaraya_watson",
    name: "Nadaraya-Watson",
    tier: "B",
    category: "mean-reversion",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "BTC",
    defaultTimeframe: "15m",
    description: "Kernel regression envelope + Stochastic RSI signals",
    params: {
      kernel_bandwidth: {
        label: "Kernel Bandwidth",
        default: 8.0,
        type: "number",
        min: 1,
        max: 30,
        step: 0.5,
      },
      kernel_lookback: {
        label: "Kernel Lookback",
        default: 60,
        type: "number",
        min: 20,
        max: 200,
      },
      stoch_period: {
        label: "Stochastic Period",
        default: 14,
        type: "number",
        min: 5,
        max: 50,
      },
    },
  },
  {
    id: "market_maker",
    name: "Market Maker",
    tier: "B",
    category: "market-making",
    status: "live",
    riskLevel: "low",
    defaultSymbol: "BTC",
    defaultTimeframe: "1m",
    description:
      "Spread-based market making with kill switch and ATR no-trade zones",
    params: {
      spread: {
        label: "Spread",
        default: 0.001,
        type: "number",
        min: 0.0005,
        max: 0.01,
        step: 0.0005,
      },
      max_position_usd: {
        label: "Max Position (USD)",
        default: 1000,
        type: "number",
        min: 100,
        max: 50000,
      },
      kill_size_usd: {
        label: "Kill Size (USD)",
        default: 2000,
        type: "number",
        min: 500,
        max: 100000,
      },
    },
  },
  {
    id: "mean_reversion",
    name: "Mean Reversion",
    tier: "B",
    category: "mean-reversion",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "ETH",
    defaultTimeframe: "15m",
    description: "Multi-timeframe SMA mean reversion with trend filter",
    params: {
      sma_trend_period: {
        label: "SMA Trend Period",
        default: 20,
        type: "number",
        min: 5,
        max: 100,
      },
      sma_entry_period: {
        label: "SMA Entry Period",
        default: 20,
        type: "number",
        min: 5,
        max: 100,
      },
      reversion_target_pct: {
        label: "Reversion Target %",
        default: 0.003,
        type: "number",
        min: 0.001,
        max: 0.01,
        step: 0.001,
      },
    },
  },
  {
    id: "sma_crossover",
    name: "SMA Crossover",
    tier: "C",
    category: "trend",
    status: "live",
    riskLevel: "low",
    defaultSymbol: "BTC",
    defaultTimeframe: "1h",
    description: "SMA crossover with support/resistance levels",
    params: {
      sma_period: {
        label: "SMA Period",
        default: 20,
        type: "number",
        min: 5,
        max: 100,
      },
      support_lookback: {
        label: "Support Lookback",
        default: 20,
        type: "number",
        min: 5,
        max: 100,
      },
    },
  },
  {
    id: "rsi",
    name: "RSI Reversal",
    tier: "C",
    category: "mean-reversion",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "BTC",
    defaultTimeframe: "1h",
    description: "RSI overbought/oversold reversal strategy",
    params: {
      rsi_period: {
        label: "RSI Period",
        default: 14,
        type: "number",
        min: 5,
        max: 50,
      },
      oversold: {
        label: "Oversold",
        default: 30,
        type: "number",
        min: 10,
        max: 40,
      },
      overbought: {
        label: "Overbought",
        default: 70,
        type: "number",
        min: 60,
        max: 90,
      },
    },
  },
  {
    id: "vwma",
    name: "VWMA Alignment",
    tier: "C",
    category: "trend",
    status: "live",
    riskLevel: "medium",
    defaultSymbol: "BTC",
    defaultTimeframe: "15m",
    description: "Volume-weighted moving average with multi-period alignment",
    params: {
      fast_period: {
        label: "Fast Period",
        default: 20,
        type: "number",
        min: 5,
        max: 50,
      },
      mid_period: {
        label: "Mid Period",
        default: 41,
        type: "number",
        min: 10,
        max: 100,
      },
      slow_period: {
        label: "Slow Period",
        default: 75,
        type: "number",
        min: 20,
        max: 200,
      },
    },
  },
]

/**
 * @deprecated Use StrategyDefinition and strategies array instead
 */
export interface StrategyStatusData {
  name: string
  status: "running" | "stopped"
  symbol: string
  timeframe: string
  lookbackPeriod: number
  atrPeriod: number
  atrMultiplier: number
  leverage: number
  lastSignal: string | null
  lastSignalTime: string | null
}

/**
 * @deprecated Use strategies array instead
 */
export const strategyStatusData: StrategyStatusData = {
  name: "Turtle",
  status: "running",
  symbol: "BTC",
  timeframe: "1h",
  lookbackPeriod: 55,
  atrPeriod: 14,
  atrMultiplier: 2.5,
  leverage: 3,
  lastSignal: "long",
  lastSignalTime: "2024-03-08 06:00",
}
