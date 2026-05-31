import type { PaperTrade } from "@/lib/api-client"

import { History } from "lucide-react"

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

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ts
  }
}

export function TradeHistory({ trades, total }: { trades: PaperTrade[]; total: number }) {
  const exits = trades.filter((t) => t.action === "exit").sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
        <History className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">Full Trade History</h3>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-data text-primary">
          {exits.length} closed trades
          {total > exits.length && ` (showing ${exits.length} of ${total})`}
        </span>
      </div>

      {exits.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No closed trades yet
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Strategy
                </TableHead>
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
                  Exit Price
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  P&L
                </TableHead>
                <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  P&L %
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Reason
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exits.map((t) => (
                <TableRow
                  key={t.id}
                  className="border-border/20 transition-colors hover:bg-primary/[0.03]"
                >
                  <TableCell className="font-data text-xs text-muted-foreground whitespace-nowrap">
                    {fmt(t.timestamp)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.strategy}</TableCell>
                  <TableCell className="font-semibold text-sm">{t.symbol}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold uppercase",
                        t.side === "long"
                          ? "border-[hsl(185_100%_42%/0.3)] bg-[hsl(185_100%_42%/0.1)] text-[hsl(185_100%_42%)]"
                          : "border-destructive/30 bg-destructive/10 text-destructive",
                      )}
                    >
                      {t.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-data text-sm">
                    ${t.size_usd.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-data text-sm text-muted-foreground">
                    {t.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-data text-sm font-semibold",
                      t.pnl > 0
                        ? "text-[hsl(185_100%_42%)]"
                        : t.pnl < 0
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {t.pnl >= 0 ? "+" : ""}
                    {t.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-data text-sm",
                      t.pnl_pct > 0
                        ? "text-[hsl(185_100%_42%)]"
                        : t.pnl_pct < 0
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {t.pnl_pct >= 0 ? "+" : ""}
                    {t.pnl_pct.toFixed(2)}%
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate font-data text-xs text-muted-foreground">
                    {t.reason || "—"}
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
