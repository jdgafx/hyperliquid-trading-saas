import Link from "next/link"
import { ChartCandlestick } from "lucide-react"

import { ToggleMobileSidebar } from "@/components/layout/toggle-mobile-sidebar"
import { DocsCommandMenu } from "./docs-command-menu"
import { DocsModeDropdown } from "./docs-mode-dropdown"

export function DocsHeader() {
  return (
    <header className="sticky top-0 w-full bg-background z-50 border-b">
      <div className="container flex justify-between items-center gap-2 p-4">
        <Link
          href="/docs"
          className="inline-flex items-center text-foreground font-black"
        >
          <ChartCandlestick className="h-6 w-6 me-2" />
          <span>Open Algotrade</span>
        </Link>
        <DocsCommandMenu buttonClassName="ms-auto" />
        <DocsModeDropdown />
        <ToggleMobileSidebar />
      </div>
    </header>
  )
}
