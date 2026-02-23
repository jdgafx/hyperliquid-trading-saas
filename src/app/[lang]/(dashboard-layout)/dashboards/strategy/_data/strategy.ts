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
  category: "trend" | "mean-reversion" | "market-making" | "statistical"
  status: "live" | "coming-soon"
  riskLevel: "low" | "medium" | "high"
  params: Record<string, ParamDef>
}

export const strategies: StrategyDefinition[] = [
  {
    id: "turtle",
    name: "Turtle Trending",
    description:
      "Classic breakout strategy using 55-bar channel breakouts with ATR-based trailing stops. Captures strong trends while managing risk through dynamic position sizing.",
    category: "trend",
    status: "live",
    riskLevel: "medium",
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
        default: 14,
        type: "number",
        min: 5,
        max: 50,
      },
      atr_multiplier: {
        label: "ATR Multiplier",
        default: 2.5,
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      leverage: {
        label: "Leverage",
        default: 3,
        type: "number",
        min: 1,
        max: 20,
      },
      timeframe: {
        label: "Timeframe",
        default: "1h",
        type: "select",
        options: ["1m", "5m", "15m", "1h", "4h", "1d"],
      },
    },
  },
  {
    id: "correlation",
    name: "Correlation",
    description:
      "Exploits cross-asset correlation divergence and convergence. Identifies pairs that typically move together and trades when they temporarily decouple.",
    category: "statistical",
    status: "coming-soon",
    riskLevel: "medium",
    params: {
      correlation_window: {
        label: "Correlation Window",
        default: 30,
        type: "number",
        min: 10,
        max: 100,
      },
      entry_threshold: {
        label: "Entry Threshold",
        default: 0.8,
        type: "number",
        min: 0.5,
        max: 1.0,
        step: 0.05,
      },
      exit_threshold: {
        label: "Exit Threshold",
        default: 0.5,
        type: "number",
        min: 0.1,
        max: 0.9,
        step: 0.05,
      },
    },
  },
  {
    id: "consolidation-pop",
    name: "Consolidation Pop",
    description:
      "Detects price consolidation ranges with low volatility, then enters aggressively on breakout. Profits from explosive moves that follow compression phases.",
    category: "trend",
    status: "coming-soon",
    riskLevel: "high",
    params: {
      consolidation_period: {
        label: "Consolidation Period",
        default: 20,
        type: "number",
        min: 5,
        max: 50,
      },
      volatility_threshold: {
        label: "Volatility Threshold",
        default: 0.02,
        type: "number",
        min: 0.005,
        max: 0.1,
        step: 0.005,
      },
      breakout_multiplier: {
        label: "Breakout Multiplier",
        default: 1.5,
        type: "number",
        min: 1.0,
        max: 3.0,
        step: 0.1,
      },
    },
  },
  {
    id: "nadaraya-watson",
    name: "Nadaraya-Watson",
    description:
      "Kernel regression envelope using non-parametric statistics. Identifies mean reversion opportunities when price deviates beyond the regression bands.",
    category: "mean-reversion",
    status: "coming-soon",
    riskLevel: "medium",
    params: {
      bandwidth: {
        label: "Bandwidth",
        default: 8,
        type: "number",
        min: 1,
        max: 50,
      },
      envelope_multiplier: {
        label: "Envelope Multiplier",
        default: 2.0,
        type: "number",
        min: 0.5,
        max: 5.0,
        step: 0.1,
      },
      lookback: {
        label: "Lookback",
        default: 100,
        type: "number",
        min: 20,
        max: 500,
      },
    },
  },
  {
    id: "market-maker",
    name: "Market Maker",
    description:
      "Spread-based market making on the Hyperliquid order book. Continuously places bids and asks around mid price to capture the spread.",
    category: "market-making",
    status: "coming-soon",
    riskLevel: "low",
    params: {
      spread: {
        label: "Spread",
        default: 0.002,
        type: "number",
        min: 0.0005,
        max: 0.01,
        step: 0.0005,
      },
      order_size: {
        label: "Order Size (USD)",
        default: 100,
        type: "number",
        min: 10,
        max: 10000,
      },
      max_position: {
        label: "Max Position (USD)",
        default: 1000,
        type: "number",
        min: 100,
        max: 50000,
      },
      refresh_interval: {
        label: "Refresh Interval (s)",
        default: 5,
        type: "number",
        min: 1,
        max: 60,
      },
    },
  },
  {
    id: "mean-reversion",
    name: "Mean Reversion",
    description:
      "Multi-ticker mean reversion using z-score analysis. Identifies assets that have deviated significantly from their historical mean and trades the return.",
    category: "mean-reversion",
    status: "coming-soon",
    riskLevel: "medium",
    params: {
      lookback: {
        label: "Lookback",
        default: 20,
        type: "number",
        min: 5,
        max: 100,
      },
      z_entry: {
        label: "Z-Score Entry",
        default: 2.0,
        type: "number",
        min: 1.0,
        max: 4.0,
        step: 0.1,
      },
      z_exit: {
        label: "Z-Score Exit",
        default: 0.5,
        type: "number",
        min: 0.0,
        max: 2.0,
        step: 0.1,
      },
      max_tickers: {
        label: "Max Tickers",
        default: 10,
        type: "number",
        min: 1,
        max: 50,
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
