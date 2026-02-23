import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChangePlan } from "./_components/change-plan"
import { CurrentPlan } from "./_components/current-plan"

export const metadata: Metadata = {
  title: "Plan and Billing",
}

export default function PlanAndBillingPage() {
  return (
    <div className="grid gap-4">
      <CurrentPlan />
      <ChangePlan />
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Open Algotrade uses USDC deposits — no credit card required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All deposits and withdrawals are processed in USDC through your
            vault. Visit the Vault page to manage your funds. Minimum deposit:
            $0.25.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
