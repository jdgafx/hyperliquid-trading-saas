import Link from "next/link"
import { ChartCandlestick } from "lucide-react"

import { footerNavigationData } from "../../_data/footer-navigation"

import { cn } from "@/lib/utils"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t-[1px] border-sidebar-border">
      <div className="container flex flex-wrap justify-between gap-6 py-6 md:px-6">
        <section className="max-w-prose w-full mb-3 space-y-1.5 md:w-auto">
          <Link
            href="/"
            className="w-fit flex items-center text-foreground font-black mb-6"
          >
            <span className="relative me-2 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 shadow-md shadow-cyan-500/25">
              <ChartCandlestick className="h-4 w-4 text-white" />
            </span>
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Open Algotrade
            </span>
          </Link>
          <h3 className="font-semibold leading-none tracking-tight">
            Subscribe to our newsletter
          </h3>
          <p className="text-sm text-muted-foreground">
            Get tips, technical guides, and best practices. Twice a month.
          </p>
          <div className="flex items-center gap-x-2 mt-2">
            <Input type="email" placeholder="name@example.com" />
            <Link href="/" className={buttonVariants()}>
              Subscribe
            </Link>
          </div>
        </section>
        {footerNavigationData.map((nav) => (
          <nav key={nav.title}>
            <ul className="w-28 grid gap-2">
              <h3 className="font-semibold leading-none tracking-tight mb-1">
                {nav.title}
              </h3>
              {nav.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    "inline h-fit p-0 text-sm text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t-[1px] border-sidebar-border">
        <div className="container flex justify-between items-center p-4 md:px-6">
          <p className="text-xs text-muted-foreground md:text-sm">
            © {currentYear}{" "}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "link" }), "inline p-0")}
            >
              Open Algotrade
            </a>
            .
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
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-medium">
              NewDawn AI
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
