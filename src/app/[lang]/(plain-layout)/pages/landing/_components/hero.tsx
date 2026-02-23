"use client"

import Link from "next/link"
import { Activity, ArrowRight, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-emerald-950/10">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
            >
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Trading
            </Badge>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Automated Crypto Trading{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Starts at $0.25
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Trade on Hyperliquid DEX with professional algorithmic strategies.
              Minimum investment of just $0.25. Fully automated. No expertise
              required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Link href="/en/register">
                  Start Trading <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/en/dashboards/analytics">View Demo</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-background">
                    A
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-background">
                    B
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-background">
                    C
                  </div>
                </div>
                <span>2,500+ traders</span>
              </div>
              <div className="text-sm">
                <span className="text-emerald-500 font-semibold">$12.4M+</span>{" "}
                <span className="text-muted-foreground">total volume</span>
              </div>
            </div>
          </div>

          {/* Live Trading Interface Preview */}
          <Card className="bg-zinc-900 dark:bg-zinc-950 border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Activity className="w-3 h-3" />
                  <span>Live Trading</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">BTC Price</div>
                    <div className="text-lg font-bold text-white">$97,234</div>
                    <div className="text-xs text-emerald-500">+2.34%</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">Your P&L</div>
                    <div className="text-lg font-bold text-emerald-500">
                      +$127.45
                    </div>
                    <div className="text-xs text-emerald-500">+12.4%</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="text-xs text-zinc-400 mb-1">
                      Active Trades
                    </div>
                    <div className="text-lg font-bold text-white">7</div>
                    <div className="text-xs text-zinc-500">of 12</div>
                  </div>
                </div>
                <div className="h-32 bg-zinc-800/30 rounded-lg flex items-end justify-between px-2 pb-2">
                  {[40, 65, 45, 80, 55, 90, 70, 60, 85, 75, 95, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="w-full bg-emerald-500/80 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    size="sm"
                  >
                    Deposit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
