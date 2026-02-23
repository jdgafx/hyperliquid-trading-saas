"use client"

import type { DictionaryType } from "@/lib/get-dictionary"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { FullscreenToggle } from "@/components/layout/full-screen-toggle"
import { ModeDropdown } from "@/components/mode-dropdown"
import { ToggleMobileSidebar } from "../toggle-mobile-sidebar"

export function VerticalLayoutHeader({
  dictionary,
}: {
  dictionary: DictionaryType
}) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
      <div className="container flex h-14 justify-between items-center gap-4">
        <ToggleMobileSidebar />
        <div className="grow flex justify-end gap-2">
          <SidebarTrigger className="hidden lg:flex lg:me-auto" />
          <FullscreenToggle />
          <ModeDropdown dictionary={dictionary} />
        </div>
      </div>
    </header>
  )
}
