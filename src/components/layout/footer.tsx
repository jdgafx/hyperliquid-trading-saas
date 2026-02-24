import Link from "next/link"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-sidebar-border">
      <div className="container flex flex-wrap justify-between items-center gap-2 p-4 md:px-6">
        <p className="text-xs text-muted-foreground md:text-sm">
          © {currentYear}{" "}
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "link" }), "inline p-0")}
          >
            Open Algotrade
          </Link>
          . Algorithmic Trading on Hyperliquid DEX.
        </p>
        <p className="text-xs text-muted-foreground md:text-sm">
          Developed by{" "}
          <a
            href="https://github.com/jdgafx"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "link" }), "inline p-0")}
          >
            Chris Gentile
          </a>
          {" / "}
          <a
            href="https://github.com/jdgafx"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "link" }), "inline p-0")}
          >
            CGDarkstardev1
          </a>
          {" / "}
          <span className="text-primary font-medium">NewDawn AI</span>
        </p>
      </div>
    </footer>
  )
}
