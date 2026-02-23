import type { PlanType } from "../types"

export const plansData: PlanType[] = [
  {
    id: 1,
    name: "Starter",
    price: 10,
    features: [
      "Up to 3 active strategies",
      "Tier C strategies only",
      "Basic performance analytics",
      "1 trading pair",
      "Email support",
    ],
  },
  {
    id: 2,
    name: "Trader Pro",
    price: 49,
    features: [
      "All 13 algorithmic strategies",
      "Tier A, B, and C strategies",
      "Advanced performance analytics",
      "Any Hyperliquid trading pair",
      "Real-time notifications",
      "Priority support",
      "API access",
    ],
  },
  {
    id: 3,
    name: "Institutional",
    price: 199,
    features: [
      "Everything in Trader Pro",
      "Unlimited sub-accounts",
      "Custom strategy parameters",
      "Dedicated account manager",
      "White-label option",
      "Custom API integrations",
      "On-premise deployment option",
    ],
  },
]
