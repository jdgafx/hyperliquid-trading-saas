import type { Metadata } from "next"

import { HyperliquidConnection } from "./_components/hyperliquid-connection"

export const metadata: Metadata = {
  title: "API Keys Settings",
}

export default function ApiKeysPage() {
  return (
    <div className="grid gap-4">
      <HyperliquidConnection />
    </div>
  )
}
