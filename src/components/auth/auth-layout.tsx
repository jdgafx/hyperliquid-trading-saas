"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ChartCandlestick } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"
import type { LocaleType } from "@/types"
import type { ComponentProps } from "react"

import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface AuthProps extends ComponentProps<"div"> {
  dictionary: DictionaryType
}

export function Auth({
  className,
  children,
  dictionary: _dictionary,
  ...props
}: AuthProps) {
  const params = useParams()
  const locale = params.lang as LocaleType

  return (
    <section
      className={cn(
        "container min-h-screen w-full flex justify-between px-0",
        className
      )}
      {...props}
    >
      <div className="flex-1 relative grid">
        <div className="absolute top-0 inset-x-0 flex justify-between items-center px-4 py-2.5">
          <Link
            href={ensureLocalizedPathname("/", locale)}
            className="flex items-center text-foreground font-black z-50"
          >
            <span className="relative me-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(211,100%,50%)]">
              <ChartCandlestick className="h-4 w-4 text-white" />
            </span>
            <span className="text-foreground">Open Algotrade</span>
          </Link>
        </div>
        <div className="max-w-[28rem] w-full m-auto px-6 py-12 space-y-6">
          {children}
        </div>
        <div className="absolute bottom-0 inset-x-0 pb-3 text-center">
          <p className="text-[0.7rem] text-muted-foreground/60">
            Developed by Christopher Gentile / CGDarkstardev1 / NewDawn AI
          </p>
        </div>
      </div>
      <AuthBrandedPanel />
    </section>
  )
}

function AuthBrandedPanel() {
  return (
    <div className="basis-1/2 relative hidden min-h-screen md:flex flex-col items-center justify-center bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,122,255,0.06),transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(211,100%,50%)]">
          <ChartCandlestick className="h-9 w-9 text-white" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Algorithmic Trading on Hyperliquid
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
          13 strategies. Zero emotion. Pure alpha.
        </p>
        <div className="mt-4 flex gap-2">
          {["Turtle", "Bollinger", "VWAP", "Funding Arb", "Market Maker"].map(
            (name) => (
              <span
                key={name}
                className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-[0.65rem] text-neutral-400"
              >
                {name}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export function AuthHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("space-y-2 text-center", className)} {...props} />
}

export function AuthTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export function AuthDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export function AuthForm({ className, ...props }: ComponentProps<"div">) {
  return <div className={className} {...props} />
}

export function AuthFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-6", className)} {...props} />
}
