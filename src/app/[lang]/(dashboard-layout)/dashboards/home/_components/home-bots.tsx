import Link from "next/link"
import { ArrowRight, Bot, Pause, Play } from "lucide-react"

import type { StrategyInstance } from "@/lib/api-client"

import { cn } from "@/lib/utils"

import { Card } from "@/components/ui/card"

interface HomeBotsProps {
  strategies: StrategyInstance[]
  backendUp: boolean
}

export function HomeBots({ strategies, backendUp }: HomeBotsProps) {
  const running = strategies.filter((s) => s.status === "running")
  const winning = running.filter((s) => (s.total_pnl ?? 0) > 0)
  const losing = running.filter((s) => (s.total_pnl ?? 0) < 0)
  const flat = running.length - winning.length - losing.length

  if (!backendUp) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold">Your bots</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We can&apos;t reach the trading server right now. Try again in a
          minute.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-muted-foreground" aria-hidden />
          <h2 className="text-xl font-semibold">Your bots</h2>
        </div>
        <Link
          href="/dashboards/strategy"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
        >
          See all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </header>

      {strategies.length === 0 ? (
        <EmptyBotsState />
      ) : (
        <>
          <p className="text-2xl font-bold tabular-nums">
            {running.length}{" "}
            <span className="text-base font-normal text-muted-foreground">
              of {strategies.length} running
            </span>
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            <BotRow
              icon={Play}
              tone="emerald"
              count={winning.length}
              label="making money right now"
            />
            <BotRow
              icon={Play}
              tone="rose"
              count={losing.length}
              label="losing money right now"
            />
            <BotRow
              icon={Play}
              tone="muted"
              count={flat}
              label="haven’t traded yet today"
            />
            <BotRow
              icon={Pause}
              tone="muted"
              count={strategies.length - running.length}
              label="paused"
            />
          </ul>
        </>
      )}
    </Card>
  )
}

function BotRow({
  icon: Icon,
  tone,
  count,
  label,
}: {
  icon: typeof Play
  tone: "emerald" | "rose" | "muted"
  count: number
  label: string
}) {
  if (count === 0) return null
  const colorMap = {
    emerald: "text-emerald-500",
    rose: "text-rose-500",
    muted: "text-muted-foreground",
  }
  return (
    <li className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4 shrink-0", colorMap[tone])} aria-hidden />
      <span className="font-semibold tabular-nums">{count}</span>
      <span className="text-muted-foreground">{label}</span>
    </li>
  )
}

function EmptyBotsState() {
  return (
    <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
      <Bot className="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden />
      <p className="mt-3 text-sm font-medium">
        You don&apos;t have any bots yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Bots run trading strategies for you.
      </p>
      <Link
        href="/dashboards/strategy"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Set up your first bot <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  )
}
