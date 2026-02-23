import type { CurrentPlanType } from "../types"

export const currentPlanData: CurrentPlanType = {
  plan: {
    name: "Trader Pro",
    price: "$49/month",
    description: "Full access to all 13 algorithmic strategies",
  },
  stats: {
    activeProjects: {
      value: 5,
      max: 13,
      progress: 38,
    },
    teamMembers: {
      value: 1,
      max: 5,
      progress: 20,
    },
    storageUsed: {
      value: 250000000,
      max: 1000000000,
      progress: 25,
    },
  },
  activityThisMonth: [
    {
      iconName: "TrendingUp",
      count: 47,
      label: "Trades Executed",
    },
    {
      iconName: "Target",
      count: 5,
      label: "Active Strategies",
    },
    {
      iconName: "DollarSign",
      count: 12,
      label: "Winning Trades",
    },
    {
      iconName: "ChartNoAxesColumn",
      count: 3,
      label: "Positions Open",
    },
  ],
  billingInfo: {
    nextBillingDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    amountDue: 49,
  },
}
