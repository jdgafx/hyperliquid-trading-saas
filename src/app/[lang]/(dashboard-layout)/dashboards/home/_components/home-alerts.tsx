import Link from "next/link"
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"

import type { DashboardStats, StrategyInstance } from "@/lib/api-client"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

interface HomeAlertsProps {
  strategies: StrategyInstance[]
  stats: DashboardStats
  backendUp: boolean
}

interface Alert {
  id: string
  tone: "warn" | "danger"
  title: string
  detail: string
  cta?: { label: string; href: string }
}

export function HomeAlerts({ strategies, stats, backendUp }: HomeAlertsProps) {
  const alerts: Alert[] = []

  if (!backendUp) {
    alerts.push({
      id: "backend-down",
      tone: "danger",
      title: "Trading server is unreachable",
      detail: "Your bots may be paused. We’ll keep trying.",
    })
  }

  // Bot with 0% win rate over 5+ trades = needs attention
  for (const s of strategies) {
    if (
      s.status === "running" &&
      (s.total_trades ?? 0) >= 5 &&
      (s.winning_trades ?? 0) === 0
    ) {
      alerts.push({
        id: `cold-${s.id}`,
        tone: "danger",
        title: `${s.name} hasn’t made a winning trade`,
        detail: `${s.total_trades} trades, all losses. Consider pausing.`,
        cta: { label: "Review bot", href: "/dashboards/strategy" },
      })
    }
    if (
      s.status === "running" &&
      (s.total_pnl ?? 0) < -10 &&
      (s.total_trades ?? 0) >= 5
    ) {
      alerts.push({
        id: `loss-${s.id}`,
        tone: "warn",
        title: `${s.name} is down $${Math.abs(s.total_pnl).toFixed(2)}`,
        detail: "Watch this one over the next day.",
        cta: { label: "Review bot", href: "/dashboards/strategy" },
      })
    }
  }

  // Big drop in account
  if (stats.total_pnl != null && stats.total_pnl < -50) {
    alerts.push({
      id: "account-down",
      tone: "warn",
      title: `Your account is down $${Math.abs(stats.total_pnl).toFixed(2)} overall`,
      detail: "Check your safety limits if this concerns you.",
      cta: { label: "Limits & alerts", href: "/dashboards/risk" },
    })
  }

  return (
    <Card className="p-6" aria-labelledby="home-alerts-heading">
      <header className="mb-4 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden />
        <h2 id="home-alerts-heading" className="text-xl font-semibold">
          Anything wrong?
        </h2>
      </header>

      {alerts.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
            aria-hidden
          />
          <div>
            <p className="font-medium">Everything looks fine.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No bots are losing badly. Your safety limits are holding.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4",
                a.tone === "danger"
                  ? "border-rose-500/20 bg-rose-500/5"
                  : "border-amber-500/20 bg-amber-500/5"
              )}
            >
              <AlertTriangle
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  a.tone === "danger" ? "text-rose-500" : "text-amber-500"
                )}
                aria-hidden
              />
              <div className="flex-1">
                <p className="font-medium">{a.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {a.detail}
                </p>
                {a.cta && (
                  <Link
                    href={a.cta.href}
                    className="mt-2 inline-block text-sm font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
                  >
                    {a.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
