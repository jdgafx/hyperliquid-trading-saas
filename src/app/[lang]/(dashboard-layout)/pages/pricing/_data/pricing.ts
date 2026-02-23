import type { PricingPlansType } from "@/components/pricing-plans"

export const pricingData: PricingPlansType[] = [
  {
    title: "Starter",
    description:
      "Get started with algorithmic trading. Access one strategy with basic controls.",
    price: 0,
    features: [
      "1 active strategy (Turtle Trending)",
      "Manual start/stop controls",
      "Basic performance metrics",
      "Community support",
      "$0.25 minimum deposit",
    ],
    isCurrentPlan: true,
    period: "month",
    href: "",
  },
  {
    title: "Pro",
    description:
      "Unlock all strategies and advanced analytics for serious traders.",
    price: 49.99,
    features: [
      "All 13 algorithmic strategies",
      "Any Hyperliquid trading pair",
      "Advanced performance analytics",
      "Real-time notifications",
      "Priority support",
      "Custom strategy parameters",
    ],
    isFeatured: true,
    period: "month",
    href: "",
  },
  {
    title: "Enterprise",
    description:
      "Full platform access with dedicated support and custom integrations.",
    price: 199.99,
    features: [
      "Everything in Pro",
      "Custom strategy development",
      "Dedicated account manager",
      "API access for automation",
      "White-label options",
      "Multi-vault management",
      "24/7 priority support",
    ],
    period: "month",
    href: "",
  },
]
