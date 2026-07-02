import { Trophy } from "lucide-react"

import type { LeaderboardEntry } from "@/lib/api-client"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.total_pnl - a.total_pnl)
  const topPnl = sorted[0]?.total_pnl ?? 1

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <Trophy className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          All-Time Leaderboard
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {entries.length} strategies
        </span>
      </div>
      <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="w-6 text-xs text-muted-foreground">
                #
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Strategy
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                P&L
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trades
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                WR%
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Avg/Trade
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((e, i) => (
              <TableRow
                key={e.name}
                className="border-border/20 transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell className="font-data text-xs text-muted-foreground">
                  {i + 1}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-semibold">
                      {e.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-4 px-1 text-[9px]",
                          e.status === "running"
                            ? "border-[hsl(185_100%_42%/0.3)] text-[hsl(185_100%_42%)]"
                            : "text-muted-foreground"
                        )}
                      >
                        {e.status}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span
                      className={cn(
                        "font-data text-sm font-semibold",
                        e.total_pnl > 0
                          ? "text-[hsl(185_100%_42%)]"
                          : e.total_pnl < 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                      )}
                    >
                      {e.total_pnl >= 0 ? "+" : ""}
                      {e.total_pnl.toFixed(2)}
                    </span>
                    {/* mini pnl bar */}
                    {e.total_pnl !== 0 && (
                      <div className="h-0.5 w-16 rounded-full bg-border/40">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            e.total_pnl > 0
                              ? "bg-[hsl(185_100%_42%)]"
                              : "bg-destructive"
                          )}
                          style={{
                            width: `${Math.min(Math.abs(e.total_pnl) / Math.abs(topPnl), 1) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-data text-sm text-muted-foreground">
                  {e.total_trades}
                </TableCell>
                <TableCell className="text-right font-data text-sm text-muted-foreground">
                  {e.total_trades > 0 ? `${e.win_rate.toFixed(0)}%` : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-data text-sm",
                    e.avg_pnl_per_trade > 0
                      ? "text-[hsl(185_100%_42%)]"
                      : e.avg_pnl_per_trade < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                  )}
                >
                  {e.total_trades > 0
                    ? `${e.avg_pnl_per_trade >= 0 ? "+" : ""}${e.avg_pnl_per_trade.toFixed(2)}`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
