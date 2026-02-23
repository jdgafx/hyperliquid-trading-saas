import type { Metadata } from "next"
import type {
  DepositHistoryItem,
  UserSharesData,
  VaultStatusData,
} from "./_data/vault"

import { api } from "@/lib/api-client"

import { DepositForm } from "./_components/deposit-form"
import { DepositHistory } from "./_components/deposit-history"
import { UserShares } from "./_components/user-shares"
import { VaultStatus } from "./_components/vault-status"

export const metadata: Metadata = {
  title: "Vault",
}

export const dynamic = "force-dynamic"

export default async function VaultPage() {
  let vaultData: VaultStatusData = {
    totalEquity: 0,
    totalShares: 0,
    navPerShare: 1.0,
    liveEquity: 0,
  }
  const sharesData: UserSharesData = {
    shares: 0,
    portfolioValue: 0,
    totalDeposited: 0,
    unrealizedPnl: 0,
    pnlPercent: 0,
  }
  const depositHistory: DepositHistoryItem[] = []

  try {
    const status = await api.getVaultStatus()

    vaultData = {
      totalEquity: status.total_equity,
      totalShares: status.total_shares,
      navPerShare: status.nav_per_share,
      liveEquity: status.live_equity ?? status.total_equity,
    }
  } catch (error) {
    console.error("Failed to fetch vault data:", error)
  }

  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <VaultStatus data={vaultData} />
      </div>
      <DepositForm />
      <UserShares data={sharesData} />
      <DepositHistory data={depositHistory} />
    </section>
  )
}
