import { Activity } from "lucide-react"

import type { ActivePosition } from "../types"

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

export function ActivePositions({ data }: { data: ActivePosition[] }) {
  return (
    <Card className="h-full overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <Activity className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Active Positions
        </h3>
        {data.length > 0 && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-data text-primary">
            {data.length}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="card-grid-bg flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
          <Activity className="size-8 opacity-30" />
          <p className="text-sm">No active positions</p>
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
                  Mark
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Unr. P&L
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Lev.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((pos) => (
                <TableRow
                  key={`${pos.symbol}-${pos.side}`}
                  className="border-border/20 transition-colors hover:bg-primary/[0.03]"
                >
                  <TableCell className="font-semibold">{pos.symbol}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        pos.side === "long"
                          ? "border-[hsl(185_100%_42%/0.3)] bg-[hsl(185_100%_42%/0.1)] text-[hsl(185_100%_42%)]"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      )}
                    >
                      {pos.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-data">
                    {pos.size}
                  </TableCell>
                  <TableCell className="text-right font-data text-muted-foreground">
                    ${pos.entryPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-data">
                    ${pos.markPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "font-data font-medium",
                        pos.unrealizedPnl >= 0
                          ? "text-success glow-profit"
                          : "text-destructive glow-loss"
                      )}
                    >
                      {pos.unrealizedPnl >= 0 ? "+" : ""}$
                      {pos.unrealizedPnl.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-data text-muted-foreground">
                      {pos.leverage}x
                    </span>
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
