"use client"

import { useCallback, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : "http://localhost:8000"

// ---------- Types ----------

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

interface RBIResult {
  strategy_name: string
  strategy_type: string
  return_pct: number
  sharpe_ratio: number
  sortino_ratio: number
  max_drawdown_pct: number
  win_rate: number
  total_trades: number
  deployed: boolean
}

interface RBIJobResults {
  job: RBIJob
  results: RBIResult[]
}

// ---------- Pipeline Steps ----------

const PIPELINE_STEPS = [
  { key: "research", label: "Research" },
  { key: "ideation", label: "Ideation" },
  { key: "coding", label: "Coding" },
  { key: "testing", label: "Testing" },
  { key: "results", label: "Results" },
] as const

function getStepIndex(step: string | null): number {
  if (!step) return -1
  const idx = PIPELINE_STEPS.findIndex((s) => s.key === step)
  return idx >= 0 ? idx : -1
}

// ---------- Helpers ----------

function statusBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default"
    case "running":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}

function formatPct(v: number): string {
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
}

function pnlColor(v: number): string {
  if (v > 0) return "text-emerald-400"
  if (v < 0) return "text-red-400"
  return "text-muted-foreground"
}

// ---------- Component ----------

interface RbiDashboardProps {
  initialJobs: RBIJob[]
}

export function RbiDashboard({ initialJobs }: RbiDashboardProps) {
  // Form state
  const [inputText, setInputText] = useState("")
  const [inputType, setInputType] = useState("text")
  const [isLaunching, setIsLaunching] = useState(false)
  const [error, setError] = useState("")

  // Job list state
  const [jobs, setJobs] = useState<RBIJob[]>(initialJobs)

  // Selected job results
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [jobResults, setJobResults] = useState<RBIJobResults | null>(null)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [deployingStrategy, setDeployingStrategy] = useState<string | null>(
    null
  )

  const launchPipeline = useCallback(async () => {
    if (!inputText.trim()) return
    setIsLaunching(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/rbi/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: inputText.trim(),
          input_type: inputType,
        }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `HTTP ${res.status}`)
      }
      const job: RBIJob = await res.json()
      setJobs((prev) => [job, ...prev])
      setInputText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to launch pipeline")
    } finally {
      setIsLaunching(false)
    }
  }, [inputText, inputType])

  const refreshJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/rbi/jobs`)
      if (res.ok) {
        const data: RBIJob[] = await res.json()
        setJobs(data)
      }
    } catch {
      // silent
    }
  }, [])

  const loadResults = useCallback(async (jobId: string) => {
    setSelectedJobId(jobId)
    setIsLoadingResults(true)
    setJobResults(null)
    try {
      const res = await fetch(
        `${API_URL}/rbi/jobs/${jobId}/results?sort_by=sharpe_ratio`
      )
      if (!res.ok) throw new Error("Failed to load results")
      const data: RBIJobResults = await res.json()
      setJobResults(data)
    } catch {
      setJobResults(null)
    } finally {
      setIsLoadingResults(false)
    }
  }, [])

  const deployStrategy = useCallback(
    async (jobId: string, strategyName: string) => {
      setDeployingStrategy(strategyName)
      try {
        const res = await fetch(`${API_URL}/rbi/jobs/${jobId}/deploy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategy_name: strategyName }),
        })
        if (!res.ok) throw new Error("Deploy failed")
        // Refresh results to show deployed state
        await loadResults(jobId)
      } catch {
        // silent
      } finally {
        setDeployingStrategy(null)
      }
    },
    [loadResults]
  )

  // Find the active job for the progress tracker
  const activeJob =
    jobs.find((j) => j.status === "running") ?? jobResults?.job ?? null
  const activeStepIdx = getStepIndex(activeJob?.current_step ?? null)

  return (
    <div className="flex flex-col gap-6">
      {/* ---------- Input Form ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Idea</CardTitle>
          <CardDescription>
            Paste a trading idea, research paper excerpt, or YouTube transcript.
            The RBI agent will research, code, backtest, and rank strategies
            automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea-input">Your Idea</Label>
            <Textarea
              id="idea-input"
              placeholder="e.g. I noticed BTC tends to bounce off the 200-day moving average when RSI is below 30. Could we combine this with volume confirmation..."
              className="min-h-[120px] resize-y"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Input Type</Label>
              <Select value={inputType} onValueChange={setInputType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={launchPipeline}
              disabled={isLaunching || !inputText.trim()}
            >
              {isLaunching ? "Launching..." : "Launch RBI Pipeline"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* ---------- Progress Tracker ---------- */}
      {activeJob && activeJob.status === "running" && (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Progress</CardTitle>
            <CardDescription>
              Job {activeJob.id.slice(0, 8)}... is currently running.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={activeJob.progress_pct} max={100} />
            <div className="flex items-center justify-between">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i === activeStepIdx
                const isComplete = i < activeStepIdx
                let dotClass =
                  "h-3 w-3 rounded-full border-2 border-muted-foreground bg-transparent"
                if (isComplete)
                  dotClass =
                    "h-3 w-3 rounded-full bg-emerald-500 border-2 border-emerald-500"
                if (isActive)
                  dotClass =
                    "h-3 w-3 rounded-full bg-primary border-2 border-primary animate-pulse"

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={dotClass} />
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? "text-primary"
                          : isComplete
                            ? "text-emerald-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Jobs Table ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>
              {jobs.length > 0
                ? `${jobs.length} pipeline runs`
                : "No jobs yet. Submit an idea above."}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshJobs}>
            Refresh
          </Button>
        </CardHeader>
        {jobs.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Strategies</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className={
                      selectedJobId === job.id ? "bg-muted/30" : undefined
                    }
                  >
                    <TableCell className="font-mono text-xs">
                      {job.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.input_type}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {job.strategies_found}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {job.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadResults(job.id)}
                          disabled={isLoadingResults}
                        >
                          View Results
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* ---------- Job Results ---------- */}
      {isLoadingResults && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading results...</p>
          </CardContent>
        </Card>
      )}

      {jobResults && !isLoadingResults && (
        <Card>
          <CardHeader>
            <CardTitle>
              Results - Job {jobResults.job.id.slice(0, 8)}...
            </CardTitle>
            <CardDescription>
              {jobResults.results.length} strategies ranked by Sharpe ratio.
              Deploy the best ones to live trading.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobResults.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No strategies generated for this job.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Return</TableHead>
                    <TableHead className="text-right">Sharpe</TableHead>
                    <TableHead className="text-right">Sortino</TableHead>
                    <TableHead className="text-right">Max DD</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobResults.results.map((r, i) => (
                    <TableRow key={r.strategy_name}>
                      <TableCell className="font-bold tabular-nums">
                        #{i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {r.strategy_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.strategy_type.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${pnlColor(r.return_pct)}`}
                      >
                        {formatPct(r.return_pct)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.sharpe_ratio.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.sortino_ratio.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-red-400">
                        {formatPct(-Math.abs(r.max_drawdown_pct))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.win_rate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.total_trades}
                      </TableCell>
                      <TableCell>
                        {r.deployed ? (
                          <Badge>Live</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              deployStrategy(jobResults.job.id, r.strategy_name)
                            }
                            disabled={deployingStrategy === r.strategy_name}
                          >
                            {deployingStrategy === r.strategy_name
                              ? "Deploying..."
                              : "Deploy to Live"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
