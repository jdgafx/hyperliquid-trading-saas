"use client"

import { Activity, Globe, Lock, Shield } from "lucide-react"

export function TrustIndicators() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container py-8">
        <p className="text-center text-sm text-muted-foreground mb-6">
          Trusted by traders worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">SECURE</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-semibold">NON-CUSTODIAL</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-semibold">GLOBAL</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold">24/7 AUTOMATED</span>
          </div>
        </div>
      </div>
    </section>
  )
}
