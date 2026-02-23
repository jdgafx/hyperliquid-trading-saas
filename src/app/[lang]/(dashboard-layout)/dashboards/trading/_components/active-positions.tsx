import { activePositionsData } from "../_data/trading"

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

export function ActivePositions() {
  return (
    <DashboardCard title="Active Positions" size="sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Mark</TableHead>
            <TableHead>Unr. P&L</TableHead>
            <TableHead>Lev.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activePositionsData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                No active positions
              </TableCell>
            </TableRow>
          ) : (
            activePositionsData.map((pos) => (
              <TableRow key={`${pos.symbol}-${pos.side}`}>
                <TableCell className="font-semibold">{pos.symbol}</TableCell>
                <TableCell>
                  <Badge
                    variant={pos.side === "long" ? "default" : "destructive"}
                  >
                    {pos.side.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{pos.size}</TableCell>
                <TableCell>${pos.entryPrice.toLocaleString()}</TableCell>
                <TableCell>${pos.markPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={
                      pos.unrealizedPnl >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {pos.unrealizedPnl >= 0 ? "+" : ""}$
                    {pos.unrealizedPnl.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>{pos.leverage}x</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DashboardCard>
  )
}
