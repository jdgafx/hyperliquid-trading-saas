import type { NavigationType } from "@/types"

// Plain-English navigation — grandmother-test compliant.
// Section + item labels avoid jargon ("position", "vault", "regime", "liquidation", "RBI", "sniper").
// Used by default. The sidebar can switch to `advancedNavigationsData` via the
// "Show advanced tools" toggle.
export const navigationsData: NavigationType[] = [
  {
    title: "Home",
    items: [
      {
        title: "Today",
        href: "/dashboards/home",
        iconName: "House",
      },
    ],
  },
  {
    title: "My Money",
    items: [
      {
        title: "Account Balance",
        href: "/dashboards/portfolio",
        iconName: "ChartPie",
      },
      {
        title: "Open Trades",
        href: "/dashboards/positions",
        iconName: "TrendingUp",
      },
      {
        title: "Trade History",
        href: "/dashboards/trading",
        iconName: "ChartCandlestick",
      },
    ],
  },
  {
    title: "My Bots",
    items: [
      {
        title: "Running Bots",
        href: "/dashboards/strategy",
        iconName: "Bot",
      },
      {
        title: "How They're Doing",
        href: "/dashboards/analytics",
        iconName: "ChartNoAxesCombined",
      },
      {
        title: "Capital Allocation",
        href: "/dashboards/compounder",
        iconName: "Layers",
      },
    ],
  },
  {
    title: "Safety",
    items: [
      {
        title: "Limits & Alerts",
        href: "/dashboards/risk",
        iconName: "ShieldAlert",
      },
      {
        title: "Fee Calculator",
        href: "/dashboards/fees",
        iconName: "Calculator",
      },
    ],
  },
  {
    title: "My Account",
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

// Power-user navigation — full feature surface incl. specialized tools.
// Toggled on via "Show advanced tools" in the sidebar footer.
export const advancedNavigationsData: NavigationType[] = [
  ...navigationsData,
  {
    title: "Advanced Tools",
    items: [
      {
        title: "Solana Auto-Buy",
        href: "/dashboards/solana-sniper",
        iconName: "Crosshair",
      },
      {
        title: "Big Loss Map",
        href: "/dashboards/liquidations",
        iconName: "Flame",
      },
      {
        title: "Big Money Moves",
        href: "/dashboards/whales",
        iconName: "Eye",
      },
      {
        title: "Market Mood",
        href: "/dashboards/regime",
        iconName: "Activity",
      },
      {
        title: "Test on Past Data",
        href: "/dashboards/backtest",
        iconName: "FlaskConical",
      },
      {
        title: "AI Strategy Builder",
        href: "/dashboards/rbi",
        iconName: "Brain",
      },
      {
        title: "Wallet",
        href: "/dashboards/vault",
        iconName: "Vault",
      },
    ],
  },
]
