import type { Metadata } from "next"

import { RbiDashboard } from "./_components/rbi-dashboard"

export const metadata: Metadata = {
  title: "RBI Agent",
}

export const dynamic = "force-dynamic"

interface RBIJob {
  id: string
  status: string
  input_type: string
  strategies_found: number
  created_at: string
  completed_at: string | null
  current_step: string | null
  progress_pct: number
}

async function fetchJobs(): Promise<RBIJob[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  try {
    const res = await fetch(`${baseUrl}/rbi/jobs`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function RbiPage() {
  const jobs = await fetchJobs()

  return (
    <section className="container p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">RBI Agent</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Research &rarr; Backtest &rarr; Implement. Feed it an idea, get a
          trading bot.
        </p>
      </div>
      <RbiDashboard initialJobs={jobs} />
    </section>
  )
}
