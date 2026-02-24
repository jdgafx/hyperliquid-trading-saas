"use client"

import { BarChart3, Bot, TrendingUp, Wallet } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: TrendingUp,
    title: "Professional Strategies",
    description:
      "AI-powered algorithmic trading strategies developed by expert quant traders.",
  },
  {
    icon: Wallet,
    title: "Start with $0.25",
    description:
      "Pooled vault architecture lets anyone start trading with minimal capital.",
  },
  {
    icon: Bot,
    title: "Fully Automated",
    description:
      "Set it and forget it. Our bots trade 24/7 on Hyperliquid DEX.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track your portfolio performance with advanced charts and metrics.",
  },
]

export function Features() {
  return (
    <section className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">
          Why Choose Open Algotrade
        </h2>
        <p className="text-muted-foreground mt-2">
          Institutional-grade trading made accessible to everyone
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="border-muted">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
