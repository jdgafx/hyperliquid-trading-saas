import type { Metadata } from "next"

import { PositionsTabs } from "./_components/positions-tabs"

export const metadata: Metadata = {
  title: "Positions",
}

export default function PositionsPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <PositionsTabs />
    </section>
  )
}
