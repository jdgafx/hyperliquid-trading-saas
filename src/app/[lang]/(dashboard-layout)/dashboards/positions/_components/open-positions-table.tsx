import { openPositionsData } from "../_data/positions"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function OpenPositionsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Entry Price</TableHead>
          <TableHead>Mark Price</TableHead>
          <TableHead>Unr. P&L</TableHead>
          <TableHead>Leverage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {openPositionsData.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground py-8"
            >
              No open positions
            </TableCell>
          </TableRow>
        ) : (
          openPositionsData.map((pos) => (
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
                <Badge
                  variant={pos.unrealizedPnl >= 0 ? "default" : "destructive"}
                >
                  {pos.unrealizedPnl >= 0 ? "+" : ""}$
                  {pos.unrealizedPnl.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell>{pos.leverage}x</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
