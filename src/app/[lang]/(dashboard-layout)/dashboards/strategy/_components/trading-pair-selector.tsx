"use client"

import { useEffect, useState } from "react"

import { api } from "@/lib/api-client"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const HYPERLIQUID_PAIRS = [
  "BTC",
  "ETH",
  "SOL",
  "DOGE",
  "WIF",
  "PEPE",
  "AVAX",
  "SUI",
  "LINK",
  "NEAR",
  "ARB",
  "OP",
  "INJ",
  "TIA",
  "SEI",
  "JUP",
  "ONDO",
  "RENDER",
  "FET",
  "WLD",
  "PYTH",
  "JTO",
  "BONK",
  "STRK",
  "MANTA",
  "DYM",
  "PIXEL",
  "PORTAL",
  "AEVO",
  "ENA",
  "W",
  "ETHFI",
  "SAGA",
  "REZ",
  "BB",
  "ZRO",
  "BLAST",
  "IO",
  "ZK",
  "LISTA",
  "NOT",
  "DOGS",
  "POPCAT",
  "GOAT",
  "GRASS",
  "DRIFT",
  "MOODENG",
  "ME",
  "MOVE",
  "HYPE",
]

interface TradingPairSelectorProps {
  selectedPair: string
  onPairChange: (pair: string) => void
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  return price.toFixed(2)
}

export function TradingPairSelector({
  selectedPair,
  onPairChange,
}: TradingPairSelectorProps) {
  const [price, setPrice] = useState<number | null>(null)
  const [fundingRate, setFundingRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setPrice(null)
    setFundingRate(null)

    api
      .getMarketPrice(selectedPair)
      .then((data) => {
        if (cancelled) return
        setPrice(data.price)
        setFundingRate(data.funding_rate)
      })
      .catch(() => {
        if (cancelled) return
        setPrice(null)
        setFundingRate(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedPair])

  const fundingIsPositive = fundingRate !== null && fundingRate >= 0

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
          ↗
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Active Trading Pair
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              {selectedPair}-PERP
            </span>
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wide"
            >
              Hyperliquid
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {isLoading && price === null && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">
              Fetching price…
            </span>
          </div>
        )}

        {price !== null && (
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-2.5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Mark Price
              </p>
              <p className="font-mono text-lg font-semibold leading-tight">
                ${formatPrice(price)}
              </p>
            </div>
            {fundingRate !== null && (
              <>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Funding
                  </p>
                  <p
                    className={`font-mono text-sm font-semibold leading-tight ${
                      fundingIsPositive ? "text-success" : "text-destructive"
                    }`}
                  >
                    {fundingIsPositive ? "+" : ""}
                    {(fundingRate * 100).toFixed(4)}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <Select value={selectedPair} onValueChange={onPairChange}>
          <SelectTrigger className="w-[160px] font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {HYPERLIQUID_PAIRS.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}-PERP
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
