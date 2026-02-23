"use client"

import { useCallback, useState } from "react"

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

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string
        params?: unknown[]
      }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (
        event: string,
        handler: (...args: unknown[]) => void
      ) => void
    }
  }
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function DepositForm() {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(e.target.value)
    setError("")
    setSuccess("")
  }

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError(
        "No wallet detected. Please install MetaMask or another Web3 wallet."
      )
      return
    }
    setIsConnecting(true)
    setError("")
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
      }
    } catch {
      setError("Wallet connection was rejected.")
    } finally {
      setIsConnecting(false)
    }
  }, [])

  function disconnectWallet() {
    setWalletAddress("")
    setAmount("")
    setError("")
    setSuccess("")
  }

  async function handleDeposit() {
    if (!walletAddress) {
      setError("Please connect your wallet first.")
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
        {!walletAddress ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to deposit funds into the vault.
            </p>
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              variant="outline"
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  Connected Wallet
                </p>
                <p className="font-mono text-sm font-medium">
                  {truncateAddress(walletAddress)}
                </p>
              </div>
              <Button onClick={disconnectWallet} variant="ghost" size="sm">
                Disconnect
              </Button>
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
