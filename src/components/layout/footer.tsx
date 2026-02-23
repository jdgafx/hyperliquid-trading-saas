import Link from "next/link"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-sidebar-border">
      <div className="container flex justify-between items-center p-4 md:px-6">
        <p className="text-xs text-muted-foreground md:text-sm">
          © {currentYear}{" "}
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "link" }), "inline p-0")}
          >
            Open Algotrade
          </Link>
          .
        </p>
        <p className="text-xs text-muted-foreground md:text-sm">
          Algorithmic Trading on Hyperliquid DEX.
        </p>
      </div>
    </footer>
  )
}
