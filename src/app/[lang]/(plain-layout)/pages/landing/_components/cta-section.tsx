"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-emerald-500 py-20">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Trading?
        </h2>
        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
          Join thousands of traders using Open Algotrade to automate their
          crypto trading. No minimum experience required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/en/register">
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent text-white border-white hover:bg-white/10"
          >
            <Link href="/en/dashboards/analytics">View Live Dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
