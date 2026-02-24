"use client"

import { useCallback, useEffect, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { api } from "@/lib/api-client"

import { Button, ButtonLoading } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function HyperliquidConnection() {
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [testResult, setTestResult] = useState<{
    valid: boolean
    address: string
  } | null>(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    address: string | null
  }>({ connected: false, address: null })

  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const status = await api.getApiKeyStatus()
      setConnectionStatus(status)
    } catch {
      // Silently handle - user may not have connected yet
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  async function handleTestConnection() {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setError("Both API Key and API Secret are required.")
      return
    }

    setIsTesting(true)
    setError("")
    setTestResult(null)
    setSuccessMessage("")

    try {
      const result = await api.testApiKey(apiKey.trim(), apiSecret.trim())
      setTestResult(result)
      if (result.valid) {
        setSuccessMessage(
          `Connection verified. Wallet address: ${result.address}`
        )
      } else {
        setError("Invalid API credentials. Please check and try again.")
      }
    } catch {
      setError("Connection test failed. Please verify your credentials.")
    } finally {
      setIsTesting(false)
    }
  }

  async function handleSave() {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setError("Both API Key and API Secret are required.")
      return
    }

    setIsSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      await api.saveApiKey(apiKey.trim(), apiSecret.trim())
      setSuccessMessage("API credentials saved successfully.")
      setApiKey("")
      setApiSecret("")
      setTestResult(null)
      await fetchStatus()
    } catch {
      setError("Failed to save credentials. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Hyperliquid Connection</CardTitle>
          {isLoadingStatus ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  connectionStatus.connected
                    ? "bg-primary"
                    : "bg-muted-foreground"
                }`}
              />
              {connectionStatus.connected ? "Connected" : "Not connected"}
            </span>
          )}
        </div>
        <CardDescription>
          Connect your Hyperliquid account by entering your API credentials. All
          trades are executed securely through our backend -- you never need to
          access Hyperliquid directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectionStatus.connected && connectionStatus.address && (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">
              Currently connected
            </p>
            <p className="mt-0.5 font-mono text-xs text-primary/70">
              {connectionStatus.address}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="hl-api-key">API Key (Wallet Address)</Label>
          <Input
            id="hl-api-key"
            type="text"
            placeholder="0x..."
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              setError("")
              setSuccessMessage("")
              setTestResult(null)
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hl-api-secret">API Secret (Private Key)</Label>
          <div className="relative">
            <Input
              id="hl-api-secret"
              type={showSecret ? "text" : "password"}
              placeholder="Your private key"
              className="pr-10"
              value={apiSecret}
              onChange={(e) => {
                setApiSecret(e.target.value)
                setError("")
                setSuccessMessage("")
                setTestResult(null)
              }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSecret(!showSecret)}
              tabIndex={-1}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {successMessage && (
          <p className="text-sm text-primary">{successMessage}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || isSaving || !apiKey || !apiSecret}
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <ButtonLoading
            type="button"
            isLoading={isSaving}
            onClick={handleSave}
            disabled={
              isTesting ||
              isSaving ||
              !apiKey ||
              !apiSecret ||
              (testResult !== null && !testResult.valid)
            }
          >
            Save
          </ButtonLoading>
        </div>

        <p className="text-xs text-muted-foreground">
          Don&apos;t have API credentials? Generate them from your Hyperliquid
          account settings. Your credentials are encrypted and stored securely
          on our servers.
        </p>
      </CardContent>
    </Card>
  )
}
