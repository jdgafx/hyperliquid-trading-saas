"use client"

import { useState } from "react"

import { api } from "@/lib/api-client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DepositForm() {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value)
    setError("")
    setSuccess("")
  }

  async function handleDeposit() {
    const value = parseFloat(amount)
    if (isNaN(value) || value < 0.25) {
      setError("Minimum deposit is $0.25")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const result = await api.deposit(1, value)
      setSuccess(
        `Deposited $${value.toFixed(2)} — you now hold ${result.shares.toFixed(4)} shares`
      )
      setAmount("")
    } catch {
      setError("Deposit failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit</CardTitle>
        <CardDescription>Minimum deposit: $0.25 USDC</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deposit-amount">Amount (USDC)</Label>
          <Input
            id="deposit-amount"
            type="number"
            min="0.25"
            step="0.01"
            placeholder="Enter amount (min $0.25)"
            value={amount}
            onChange={handleAmountChange}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
        </div>
        <Button
          onClick={handleDeposit}
          disabled={isLoading || !amount}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Deposit"}
        </Button>
      </CardContent>
    </Card>
  )
}
