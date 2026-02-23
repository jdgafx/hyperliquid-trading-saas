import type { RouteType } from "@/types"

export const routeMap = new Map<string, RouteType>([
  ["/sign-in", { type: "guest" }],
  ["/register", { type: "guest" }],
  ["/forgot-password", { type: "guest" }],
  ["/verify-email", { type: "guest" }],
  ["/new-password", { type: "guest" }],
  ["", { type: "public" }],
  ["/", { type: "public" }],
  ["/pages/landing", { type: "public" }],
  ["/pages/pricing", { type: "public" }],
  ["/docs", { type: "public" }],
  ["/dashboards", { type: "public" }],
  ["/pages", { type: "protected" }],
])
