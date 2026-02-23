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
