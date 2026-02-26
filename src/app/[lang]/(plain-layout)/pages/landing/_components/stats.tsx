"use client"

import { Activity, Bot, DollarSign, TrendingUp } from "lucide-react"

const stats = [
  { icon: Bot, value: "24", label: "Trading Strategies" },
  { icon: Activity, value: "99.9%", label: "Uptime" },
  { icon: DollarSign, value: "$0.25", label: "Min. Investment" },
  { icon: TrendingUp, value: "3", label: "Market Regimes Tracked" },
]

export function Stats() {
  return (
    <section className="bg-zinc-950 text-white py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
