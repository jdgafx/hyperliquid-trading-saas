import { recentTradesData } from "../_data/trading"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardCard } from "@/components/dashboards/dashboard-card"

export function RecentTrades() {
  return (
    <DashboardCard title="Recent Trades" size="sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTradesData.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="font-semibold">{trade.symbol}</TableCell>
              <TableCell>
                <Badge
                  variant={trade.side === "long" ? "default" : "destructive"}
                >
                  {trade.side.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{trade.size}</TableCell>
              <TableCell>${trade.entryPrice.toLocaleString()}</TableCell>
              <TableCell>
                {trade.pnl !== null ? (
                  <span
                    className={
                      trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={trade.status === "open" ? "outline" : "secondary"}
                >
                  {trade.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  )
}
