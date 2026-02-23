"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import type { LocaleType } from "@/types"

import { api } from "@/lib/api-client"
import { ensureLocalizedPathname } from "@/lib/i18n"

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

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function DepositForm() {
  const params = useParams()
  const locale = params.lang as LocaleType

  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [isCheckingConnection, setIsCheckingConnection] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    address: string | null
  }>({ connected: false, address: null })

  const checkConnection = useCallback(async () => {
    setIsCheckingConnection(true)
    try {
      const status = await api.getApiKeyStatus()
      setConnectionStatus(status)
    } catch {
      setConnectionStatus({ connected: false, address: null })
    } finally {
      setIsCheckingConnection(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value)
    setError("")
    setSuccess("")
  }

  async function handleDeposit() {
    if (!connectionStatus.connected) {
      setError("Please connect your Hyperliquid account first.")
      return
    }
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
        `Deposited $${value.toFixed(2)} -- you now hold ${result.shares.toFixed(4)} shares`
      )
      setAmount("")
    } catch {
      setError("Deposit failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
          <CardDescription>Minimum deposit: $0.25 USDC</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit</CardTitle>
        <CardDescription>Minimum deposit: $0.25 USDC</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connectionStatus.connected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Hyperliquid account first to deposit funds into the
              vault.
            </p>
            <Link
              href={ensureLocalizedPathname(
                "/pages/account/settings/api-keys",
                locale
              )}
            >
              <Button variant="outline" className="w-full">
                Connect Hyperliquid Account
              </Button>
            </Link>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  Hyperliquid Account
                </p>
                <p className="font-mono text-sm font-medium">
                  {connectionStatus.address
                    ? truncateAddress(connectionStatus.address)
                    : "Connected"}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
