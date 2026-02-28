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
      {
        title: "Portfolio",
        href: "/dashboards/portfolio",
        iconName: "ChartPie",
      },
      { title: "Strategies", href: "/dashboards/strategy", iconName: "Bot" },
      {
        title: "Positions",
        href: "/dashboards/positions",
        iconName: "TrendingUp",
      },
      {
        title: "Risk Controller",
        href: "/dashboards/risk",
        iconName: "ShieldAlert",
      },
      { title: "Vault", href: "/dashboards/vault", iconName: "Vault" },
    ],
  },
  {
    title: "Solana",
    items: [
      {
        title: "Sniper",
        href: "/dashboards/solana-sniper",
        iconName: "Crosshair",
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        title: "Liquidation Heatmap",
        href: "/dashboards/liquidations",
        iconName: "Flame",
      },
      {
        title: "Whale Tracker",
        href: "/dashboards/whales",
        iconName: "Eye",
      },
      {
        title: "Market Regime",
        href: "/dashboards/regime",
        iconName: "Activity",
      },
    ],
  },
  {
    title: "Lab",
    items: [
      {
        title: "Backtesting",
        href: "/dashboards/backtest",
        iconName: "FlaskConical",
      },
      {
        title: "RBI Agent",
        href: "/dashboards/rbi",
        iconName: "Brain",
      },
      {
        title: "Fee Calculator",
        href: "/dashboards/fees",
        iconName: "Calculator",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Performance",
        href: "/dashboards/analytics",
        iconName: "ChartNoAxesCombined",
      },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Profile", href: "/pages/account/profile", iconName: "User" },
      {
        title: "Settings",
        href: "/pages/account/settings",
        iconName: "Settings2",
      },
      {
        title: "Billing",
        href: "/pages/account/settings/plan-and-billing",
        iconName: "CreditCard",
      },
    ],
  },
]
