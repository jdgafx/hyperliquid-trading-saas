"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ChartCandlestick } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"

import { ensureLocalizedPathname } from "@/lib/i18n"

import { FullscreenToggle } from "@/components/layout/full-screen-toggle"
import { ModeDropdown } from "@/components/mode-dropdown"
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar"

export function BottomBarHeader({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  const params = useParams()
  const locale = params.lang as LocaleType

  return (
    <div className="container flex h-14 justify-between items-center gap-4">
      <ToggleMobileSidebar />
      <Link
        href={ensureLocalizedPathname("/", locale)}
        className="hidden text-foreground font-black lg:flex items-center gap-2"
      >
        <ChartCandlestick className="h-6 w-6" />
        <span>Open Algotrade</span>
      </Link>
      <div className="flex gap-2">
        <FullscreenToggle />
        <ModeDropdown dictionary={dictionary} />
      </div>
    </div>
  )
}
