import { vaultStatusData } from "../_data/vault"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function VaultStatus() {
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
              {vaultStatusData.totalEquity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Shares</p>
            <p className="text-xl font-semibold">
              {vaultStatusData.totalShares.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">NAV Per Share</p>
            <p className="text-xl font-semibold">
              ${vaultStatusData.navPerShare.toFixed(4)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Live Equity</p>
            <p className="text-xl font-semibold">
              $
              {vaultStatusData.liveEquity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
