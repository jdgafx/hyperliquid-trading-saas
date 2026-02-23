import { userSharesData } from "../_data/vault"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserShares() {
  const pnlPositive = userSharesData.unrealizedPnl >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Shares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Shares Held</p>
            <p className="text-xl font-semibold">
              {userSharesData.shares.toFixed(4)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-xl font-semibold">
              ${userSharesData.portfolioValue.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Deposited</p>
            <p className="text-xl font-semibold">
              ${userSharesData.totalDeposited.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Unrealized P&L</p>
            <p
              className={`text-xl font-semibold ${pnlPositive ? "text-green-500" : "text-red-500"}`}
            >
              {pnlPositive ? "+" : ""}${userSharesData.unrealizedPnl.toFixed(2)}{" "}
              <span className="text-sm">
                ({pnlPositive ? "+" : ""}
                {(userSharesData.pnlPercent * 100).toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
