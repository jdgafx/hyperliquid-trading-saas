import type { VaultStatusData } from "../_data/vault"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function VaultStatus({ data }: { data: VaultStatusData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vault Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Equity</p>
            <p className="text-xl font-semibold">
              $
              {data.totalEquity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Shares</p>
            <p className="text-xl font-semibold">
              {data.totalShares.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">NAV Per Share</p>
            <p className="text-xl font-semibold">
              ${data.navPerShare.toFixed(4)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Live Equity</p>
            <p className="text-xl font-semibold">
              $
              {data.liveEquity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
