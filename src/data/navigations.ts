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
        title: "Security",
        href: "/pages/account/settings/security",
        iconName: "Shield",
      },
      {
        title: "Billing",
        href: "/pages/account/settings/plan-and-billing",
        iconName: "CreditCard",
      },
      {
        title: "Notification Settings",
        href: "/pages/account/settings/notifications",
        iconName: "Bell",
      },
    ],
  },
  {
    title: "Plans",
    items: [
      { title: "Pricing", href: "/pages/pricing", iconName: "DollarSign" },
      { title: "Deposit", href: "/pages/payment", iconName: "Wallet" },
    ],
  },
]
