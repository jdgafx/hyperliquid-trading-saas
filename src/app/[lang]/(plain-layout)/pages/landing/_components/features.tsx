"use client"

import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  Eye,
  Flame,
  FlaskConical,
  ShieldAlert,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: ShieldAlert,
    title: "Risk Controller",
    description:
      "Real-time drawdown limits, margin monitoring, and automatic kill switch when volatility spikes.",
  },
  {
    icon: Bot,
    title: "24 Strategies",
    description:
      "Turtle, Bollinger, VWAP, funding arb, supply/demand zones, market making, and 18 more — all automated.",
  },
  {
    icon: Flame,
    title: "Liquidation Intel",
    description:
      "See every whale's distance to liquidation. Trade the cascading liquidation zones before they trigger.",
  },
  {
    icon: Eye,
    title: "Whale Tracker",
    description:
      "Monitor top traders' positions in real-time. Follow the smart money, avoid the blown-up money.",
  },
  {
    icon: Activity,
    title: "Regime Detection",
    description:
      "HMM-based market regime classification. Know if you're in a trend, mean-revert, or high-vol regime.",
  },
  {
    icon: Brain,
    title: "RBI Agent",
    description:
      "Feed it an idea, get a trading bot. Research → Backtest → Implement pipeline, fully automated.",
  },
  {
    icon: FlaskConical,
    title: "Backtesting Lab",
    description:
      "Test any strategy with 2x commission before risking real capital. Multi-symbol, multi-timeframe.",
  },
  {
    icon: Wallet,
    title: "Start with $0.25",
    description:
      "Pooled vault architecture on Hyperliquid DEX. Maker-only execution for lowest fees.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "P&L tracking, Sharpe ratios, drawdown charts, and fee death calculator to keep costs in check.",
  },
  {
    icon: TrendingUp,
    title: "Multi-Strategy Portfolio",
    description:
      "Run uncorrelated strategies simultaneously. Multiple small edges compound into a consistent return.",
  },
]

export function Features() {
  return (
    <section className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">
          Every Edge, One Platform
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Institutional-grade intelligence — liquidation data, whale tracking,
          regime detection, and 24 battle-tested strategies — accessible to
          everyone.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="border-muted">
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
