import { strategyStatusData } from "../_data/strategy"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StrategyStatus() {
  const { name, status, symbol, timeframe, lastSignal, lastSignalTime } =
    strategyStatusData

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{name} Strategy</CardTitle>
        <Badge
          variant={status === "running" ? "default" : "secondary"}
          className="text-sm px-3 py-1"
        >
          {status === "running" ? "● Running" : "○ Stopped"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Symbol</p>
            <p className="text-lg font-semibold">{symbol}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Timeframe</p>
            <p className="text-lg font-semibold">{timeframe}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Last Signal</p>
            {lastSignal ? (
              <div className="flex flex-col">
                <Badge
                  variant={lastSignal === "long" ? "default" : "destructive"}
                  className="w-fit"
                >
                  {lastSignal.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground mt-1">
                  {lastSignalTime}
                </span>
              </div>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">—</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
