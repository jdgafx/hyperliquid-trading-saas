import type { WhaleInfo, WhaleStats } from "@/lib/api-client"
import type { Metadata } from "next"

import { api } from "@/lib/api-client"

import { WhalesDashboard } from "./_components/whales-dashboard"

export const metadata: Metadata = {
  title: "Whale Intelligence",
}

export const dynamic = "force-dynamic"

export default async function WhalesPage() {
  let whales: WhaleInfo[] = []
  let stats: WhaleStats = {
    total_tracked: 0,
    blown_up_count: 0,
    blown_up_pct: 0,
    total_whale_equity: 0,
    avg_leverage: 0,
    top_profitable_count: 0,
  }

  try {
    const [apiWhales, apiStats] = await Promise.all([
      api.getWhales("equity", 50),
      api.getWhaleStats(),
    ])

    whales = apiWhales
    stats = apiStats
  } catch (error) {
    console.error("Failed to fetch whale data:", error)
  }

  return (
    <section className="container p-4 md:p-6">
      <WhalesDashboard initialWhales={whales} initialStats={stats} />
    </section>
  )
}
