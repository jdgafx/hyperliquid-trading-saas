import type { OpenPosition, TradeHistory } from "../_data/positions"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardCard } from "@/components/dashboards/dashboard-card"
import { OpenPositionsTable } from "./open-positions-table"
import { TradeHistoryTable } from "./trade-history-table"

interface PositionsTabsProps {
  positions: OpenPosition[]
  history: TradeHistory[]
}

export function PositionsTabs({ positions, history }: PositionsTabsProps) {
  return (
    <DashboardCard title="Positions" size="lg" className="md:col-span-2">
      <Tabs defaultValue="open">
        <TabsList className="mb-4">
          <TabsTrigger value="open">Open Positions</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>
        <TabsContent value="open">
          <OpenPositionsTable data={positions} />
        </TabsContent>
        <TabsContent value="history">
          <TradeHistoryTable data={history} />
        </TabsContent>
      </Tabs>
    </DashboardCard>
  )
}
