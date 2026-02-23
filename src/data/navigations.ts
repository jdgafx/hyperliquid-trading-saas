import type { NavigationType } from "@/types"

export const navigationsData: NavigationType[] = [
  {
    title: "Trading",
    items: [
      {
        title: "Overview",
        href: "/dashboards/trading",
        iconName: "ChartCandlestick",
      },
      { title: "Vault", href: "/dashboards/vault", iconName: "Vault" },
      {
        title: "Positions",
        href: "/dashboards/positions",
        iconName: "TrendingUp",
      },
      { title: "Strategy", href: "/dashboards/strategy", iconName: "Bot" },
    ],
  },
]
