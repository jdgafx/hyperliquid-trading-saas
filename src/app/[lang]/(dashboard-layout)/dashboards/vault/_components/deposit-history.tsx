import { depositHistoryData } from "../_data/vault"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardCard } from "@/components/dashboards/dashboard-card"

export function DepositHistory() {
  return (
    <DashboardCard title="Deposit History" size="sm" className="md:col-span-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount (USDC)</TableHead>
            <TableHead>Shares Received</TableHead>
            <TableHead>Tx Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {depositHistoryData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No deposits yet
              </TableCell>
            </TableRow>
          ) : (
            depositHistoryData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-semibold">
                  ${item.amount.toFixed(2)}
                </TableCell>
                <TableCell>{item.sharesReceived.toFixed(4)}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.txHash}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DashboardCard>
  )
}
