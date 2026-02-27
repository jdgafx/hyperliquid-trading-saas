import { History } from "lucide-react"

import type { RecentTrade } from "../types"

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

export function RecentTrades({ data }: { data: RecentTrade[] }) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <History className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Recent Trades
        </h3>
        {data.length > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-data text-primary">
            {data.length}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="card-grid-bg flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
          <History className="size-8 opacity-30" />
          <p className="text-sm">No trades yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Symbol
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Side
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Size
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Entry
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  P&L
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((trade) => (
                <TableRow
                  key={trade.id}
                  className="border-border/20 transition-colors hover:bg-primary/[0.03]"
                >
                  <TableCell className="font-semibold">
                    {trade.symbol}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        trade.side === "long"
                          ? "border-[hsl(185_100%_42%/0.3)] bg-[hsl(185_100%_42%/0.1)] text-[hsl(185_100%_42%)]"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      )}
                    >
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-data">
                    {trade.size}
                  </TableCell>
                  <TableCell className="text-right font-data text-muted-foreground">
                    ${trade.entryPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.pnl !== null ? (
                      <span
                        className={cn(
                          "font-data font-medium",
                          trade.pnl >= 0
                            ? "text-success glow-profit"
                            : "text-destructive glow-loss"
                        )}
                      >
                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-data text-muted-foreground">
                        --
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium",
                        trade.status === "open"
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
