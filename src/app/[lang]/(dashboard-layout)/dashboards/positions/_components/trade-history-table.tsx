import type { TradeHistory } from "../_data/positions"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TradeHistoryTable({ data }: { data: TradeHistory[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Entry</TableHead>
          <TableHead>Exit</TableHead>
          <TableHead>P&L</TableHead>
          <TableHead>Exit Reason</TableHead>
          <TableHead>Closed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center text-muted-foreground py-8"
            >
              No trade history
            </TableCell>
          </TableRow>
        ) : (
          data.map((trade) => (
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
              <TableCell>${trade.exitPrice.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={trade.pnl >= 0 ? "default" : "destructive"}>
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">
                {trade.exitReason.replace("_", " ")}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {trade.closedAt}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
