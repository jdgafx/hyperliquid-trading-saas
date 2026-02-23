"use client"

import { Bot, TrendingUp, Wallet } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Link your wallet and deposit as little as $0.25 to start trading.",
  },
  {
    number: "02",
    icon: Bot,
    title: "Choose Strategy",
    description:
      "Select from our proven algorithmic strategies or let AI optimize for you.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Earn Returns",
    description: "Watch your portfolio grow with automated trading 24/7.",
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
            <div className="text-6xl font-black text-emerald-500/20 absolute -top-2 -left-2">
              {step.number}
            </div>
            <div className="pt-8 pl-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-emerald-500" />
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
