"use client"

import { TrendingUp } from "lucide-react"

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

interface Entry {
  name: string
  strategy_type: string
  total_pnl: number
  total_trades: number
  win_rate: number
  size_usd: number
  profitable: boolean
}

export function AllocationTable({ entries }: { entries: Entry[] }) {
  const sorted = [...entries].sort((a, b) => b.total_pnl - a.total_pnl)
  const maxSize = Math.max(...sorted.map((e) => e.size_usd), 1)

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <TrendingUp className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">Running Allocations</h3>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-data text-primary">
          {entries.length}
        </span>
      </div>
      <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Strategy
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Size
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                P&L
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                WR%
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Trades
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((e) => (
              <TableRow
                key={e.name}
                className="border-border/20 transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-semibold">{e.name}</span>
                    {/* allocation bar */}
                    <div className="h-1 w-24 rounded-full bg-border/40">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          e.profitable
                            ? "bg-[hsl(185_100%_42%)]"
                            : "bg-muted-foreground/40",
                        )}
                        style={{ width: `${(e.size_usd / maxSize) * 100}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-data text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-data text-xs",
                      e.size_usd > 500
                        ? "border-[hsl(185_100%_42%/0.4)] bg-[hsl(185_100%_42%/0.1)] text-[hsl(185_100%_42%)]"
                        : "text-muted-foreground",
                    )}
                  >
                    ${e.size_usd.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-data text-sm font-semibold",
                    e.total_pnl > 0 ? "text-[hsl(185_100%_42%)]" : e.total_pnl < 0 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {e.total_pnl >= 0 ? "+" : ""}
                  {e.total_pnl.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-data text-sm text-muted-foreground">
                  {e.total_trades > 0 ? `${e.win_rate.toFixed(0)}%` : "—"}
                </TableCell>
                <TableCell className="text-right font-data text-sm text-muted-foreground">
                  {e.total_trades}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
