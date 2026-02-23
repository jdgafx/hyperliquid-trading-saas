"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function StrategyControls() {
  const [isRunning, setIsRunning] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle() {
    setIsLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      setIsRunning((prev) => !prev)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Controls</CardTitle>
        <CardDescription>
          {isRunning
            ? "Strategy is currently active and trading."
            : "Strategy is stopped. Start it to resume trading."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          onClick={handleToggle}
          disabled={isLoading || isRunning}
        >
          {isLoading && !isRunning ? "Starting..." : "Start Strategy"}
        </Button>
        <Button
          size="lg"
          variant="destructive"
          className="flex-1"
          onClick={handleToggle}
          disabled={isLoading || !isRunning}
        >
          {isLoading && isRunning ? "Stopping..." : "Stop Strategy"}
        </Button>
      </CardContent>
    </Card>
  )
}
