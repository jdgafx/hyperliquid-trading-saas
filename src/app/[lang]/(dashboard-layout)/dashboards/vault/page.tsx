import type { Metadata } from "next"

import { DepositForm } from "./_components/deposit-form"
import { DepositHistory } from "./_components/deposit-history"
import { UserShares } from "./_components/user-shares"
import { VaultStatus } from "./_components/vault-status"

export const metadata: Metadata = {
  title: "Vault",
}

export default function VaultPage() {
  return (
    <section className="container grid gap-4 p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <VaultStatus />
      </div>
      <DepositForm />
      <UserShares />
      <DepositHistory />
    </section>
  )
}
