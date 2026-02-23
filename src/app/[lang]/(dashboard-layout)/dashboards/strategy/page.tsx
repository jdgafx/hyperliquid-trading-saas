import type { Metadata } from "next"

import { StrategyConfigForm } from "./_components/strategy-config-form"
import { StrategyControls } from "./_components/strategy-controls"
import { StrategyStatus } from "./_components/strategy-status"

export const metadata: Metadata = {
  title: "Strategy",
}

export default function StrategyPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <StrategyStatus />
      </div>
      <StrategyControls />
      <StrategyConfigForm />
    </section>
  )
}
