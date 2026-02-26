"use client"

import { Bot, TrendingUp, Wallet } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Deposit & Configure",
    description:
      "Deposit as little as $0.25. Set your risk limits — max drawdown, leverage cap, daily loss limit. The risk controller protects you 24/7.",
  },
  {
    number: "02",
    icon: Bot,
    title: "Deploy Strategies",
    description:
      "Pick from 24 battle-tested strategies or use the RBI Agent to generate new ones from any trading idea. Backtest first, deploy with one click.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Compound Your Edge",
    description:
      "Strategies auto-trade on Hyperliquid with maker-only execution. Monitor whale positions, liquidation zones, and regime shifts in real-time.",
  },
]

export function HowItWorks() {
  return (
    <section className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
        <p className="text-muted-foreground mt-2">
          Start automated trading in 3 simple steps
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.number} className="relative">
            <div className="text-6xl font-black text-primary/20 absolute -top-2 -left-2">
              {step.number}
            </div>
            <div className="pt-8 pl-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
