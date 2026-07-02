import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import type { DashboardStats } from "@/lib/api-client"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

interface HomeHeroProps {
  stats: DashboardStats
  backendUp: boolean
}

export function HomeHero({ stats, backendUp }: HomeHeroProps) {
  const balance = stats.vault_equity ?? 0
  const pnl = stats.total_pnl ?? 0
  const isUp = pnl > 0
  const isFlat = pnl === 0
  const Trend = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight
  const trendColor = isFlat
    ? "text-muted-foreground"
    : isUp
      ? "text-emerald-500"
      : "text-rose-500"
  const trendBg = isFlat
    ? "bg-muted"
    : isUp
      ? "bg-emerald-500/10"
      : "bg-rose-500/10"

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 sm:p-8",
        "bg-gradient-to-br from-card to-card/50"
      )}
      aria-labelledby="home-hero-label"
    >
      <p
        id="home-hero-label"
        className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
      >
        Your account balance
      </p>
      <p
        className="mt-2 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
        aria-live="polite"
      >
        ${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
            trendBg,
            trendColor
          )}
        >
          <Trend className="h-4 w-4" aria-hidden />
          <span>
            {isFlat
              ? "No change yet"
              : `${isUp ? "+" : ""}$${pnl.toLocaleString("en-US", { maximumFractionDigits: 2 })} so far`}
          </span>
        </span>
        {!backendUp && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500"
          >
            Live data not reaching us right now
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {isFlat
          ? "Your bots haven’t made or lost money yet."
          : isUp
            ? "You’re ahead today. Nothing for you to do."
            : "You’re a little down. This is normal day-to-day."}
      </p>
    </Card>
  )
}
