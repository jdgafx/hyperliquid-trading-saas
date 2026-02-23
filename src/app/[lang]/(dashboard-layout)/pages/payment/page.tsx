import { redirect } from "next/navigation"

import type { LocaleType } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Deposit",
}

export default async function PaymentPage(props: {
  params: Promise<{ lang: LocaleType }>
}) {
  const params = await props.params
  redirect(`/${params.lang}/dashboards/vault`)
}
