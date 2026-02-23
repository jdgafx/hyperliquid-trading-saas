"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Key,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react"

import type { LocaleType } from "@/types"

import { api } from "@/lib/api-client"
import { ensureLocalizedPathname } from "@/lib/i18n"
import { cn, ensureRedirectPathname } from "@/lib/utils"

import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button, ButtonLoading } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SeparatorWithText } from "@/components/ui/separator"
import { OAuthLinks } from "./oauth-links"

// ---------------------------------------------------------------------------
// Strategy registry (mirrors the 13 backend strategies)
// ---------------------------------------------------------------------------

interface StrategyInfo {
  name: string
  label: string
  description: string
}

const STRATEGY_TIERS: {
  tier: string
  label: string
  variant: "default" | "secondary" | "outline"
  strategies: StrategyInfo[]
}[] = [
  {
    tier: "A",
    label: "HL Native",
    variant: "default",
    strategies: [
      {
        name: "turtle",
        label: "Turtle",
        description: "55-bar breakout + ATR trailing stops",
      },
      {
        name: "bollinger",
        label: "Bollinger",
        description: "Bollinger Band squeeze breakout",
      },
      {
        name: "supply_demand_zone",
        label: "Supply/Demand Zone",
        description: "Pivot-based zone reversal",
      },
      {
        name: "vwap_bot",
        label: "VWAP Bot",
        description: "VWAP probability bias (70/30)",
      },
      {
        name: "funding_arb",
        label: "Funding Arb",
        description: "Funding rate arb (BTC/ETH)",
      },
    ],
  },
  {
    tier: "B",
    label: "Bonus",
    variant: "secondary",
    strategies: [
      {
        name: "correlation",
        label: "Correlation",
        description: "Leader/follower lag trading",
      },
      {
        name: "consolidation_pop",
        label: "Consolidation Pop",
        description: "TR deviance range breakout",
      },
      {
        name: "nadaraya_watson",
        label: "Nadaraya-Watson",
        description: "Kernel regression + StochRSI",
      },
      {
        name: "market_maker",
        label: "Market Maker",
        description: "Spread MM with kill switch",
      },
      {
        name: "mean_reversion",
        label: "Mean Reversion",
        description: "Multi-TF SMA mean reversion",
      },
    ],
  },
  {
    tier: "C",
    label: "Bootcamp",
    variant: "outline",
    strategies: [
      {
        name: "sma_crossover",
        label: "SMA Crossover",
        description: "SMA + support/resistance",
      },
      {
        name: "rsi",
        label: "RSI",
        description: "Overbought/oversold reversal",
      },
      {
        name: "vwma",
        label: "VWMA",
        description: "Volume-weighted MA alignment",
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Step progress indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { number: 1, label: "Account", icon: User },
  { number: 2, label: "Profile", icon: ShieldCheck },
  { number: 3, label: "Connect", icon: Key },
] as const

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((step, idx) => {
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep
        const StepIcon = step.icon

        return (
          <div key={step.number} className="flex items-center gap-2">
            {idx > 0 && (
              <div
                className={cn(
                  "h-px w-8 transition-colors duration-300",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground scale-110",
                  isCompleted && "border-primary bg-primary/20 text-primary",
                  !isActive &&
                    !isCompleted &&
                    "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors duration-300",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wizard state types
// ---------------------------------------------------------------------------

interface Step1State {
  email: string
  password: string
  confirmPassword: string
  agreedToTerms: boolean
}

interface Step2State {
  displayName: string
  experienceLevel: "beginner" | "intermediate" | "advanced" | ""
  riskTolerance: "conservative" | "moderate" | "aggressive" | ""
  preferredStrategies: string[]
}

interface Step3State {
  hlApiKey: string
  hlApiSecret: string
  showSecret: boolean
  testStatus: "idle" | "testing" | "valid" | "invalid"
  testAddress: string
  depositAmount: string
}

// ---------------------------------------------------------------------------
// Main RegisterForm (Wizard)
// ---------------------------------------------------------------------------

export function RegisterForm() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const locale = params.lang as LocaleType
  const redirectPathname = searchParams.get("redirectTo")

  // Current step
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1 state
  const [step1, setStep1] = useState<Step1State>({
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  })
  const [step1Errors, setStep1Errors] = useState<
    Partial<Record<keyof Step1State, string>>
  >({})

  // Step 2 state
  const [step2, setStep2] = useState<Step2State>({
    displayName: "",
    experienceLevel: "",
    riskTolerance: "",
    preferredStrategies: [],
  })
  const [step2Errors, setStep2Errors] = useState<
    Partial<Record<keyof Step2State, string>>
  >({})

  // Step 3 state
  const [step3, setStep3] = useState<Step3State>({
    hlApiKey: "",
    hlApiSecret: "",
    showSecret: false,
    testStatus: "idle",
    testAddress: "",
    depositAmount: "",
  })
  const [step3Errors, setStep3Errors] = useState<
    Partial<Record<keyof Step3State, string>>
  >({})

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateStep1 = useCallback((): boolean => {
    const errors: Partial<Record<keyof Step1State, string>> = {}

    if (!step1.email.trim()) {
      errors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email)) {
      errors.email = "Invalid email address."
    }

    if (!step1.password) {
      errors.password = "Password is required."
    } else if (step1.password.length < 8) {
      errors.password = "Password must be at least 8 characters."
    } else if (!/(?=.*[a-zA-Z])/.test(step1.password)) {
      errors.password = "Password must contain at least one letter."
    } else if (!/(?=.*[0-9])/.test(step1.password)) {
      errors.password = "Password must contain at least one number."
    }

    if (!step1.confirmPassword) {
      errors.confirmPassword = "Please confirm your password."
    } else if (step1.password !== step1.confirmPassword) {
      errors.confirmPassword = "Passwords do not match."
    }

    if (!step1.agreedToTerms) {
      errors.agreedToTerms = "You must agree to the terms of service."
    }

    setStep1Errors(errors)
    return Object.keys(errors).length === 0
  }, [step1])

  const validateStep2 = useCallback((): boolean => {
    const errors: Partial<Record<keyof Step2State, string>> = {}

    if (!step2.displayName.trim()) {
      errors.displayName = "Display name is required."
    } else if (step2.displayName.trim().length < 2) {
      errors.displayName = "Display name must be at least 2 characters."
    }

    if (!step2.experienceLevel) {
      errors.experienceLevel = "Please select your experience level."
    }

    if (!step2.riskTolerance) {
      errors.riskTolerance = "Please select your risk tolerance."
    }

    setStep2Errors(errors)
    return Object.keys(errors).length === 0
  }, [step2])

  const validateStep3 = useCallback((): boolean => {
    const errors: Partial<Record<keyof Step3State, string>> = {}

    if (step3.depositAmount) {
      const amount = parseFloat(step3.depositAmount)
      if (isNaN(amount) || amount < 0.25) {
        errors.depositAmount = "Minimum deposit is $0.25."
      }
    }

    setStep3Errors(errors)
    return Object.keys(errors).length === 0
  }, [step3])

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const goNext = useCallback(() => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }, [step, validateStep1, validateStep2])

  const goBack = useCallback(() => {
    if (step > 1) setStep(step - 1)
  }, [step])

  // ---------------------------------------------------------------------------
  // Hyperliquid API key test
  // ---------------------------------------------------------------------------

  const testHlConnection = useCallback(async () => {
    if (!step3.hlApiKey.trim() || !step3.hlApiSecret.trim()) {
      toast({
        variant: "destructive",
        title: "Missing credentials",
        description: "Both API Key and API Secret are required.",
      })
      return
    }

    setStep3((prev) => ({ ...prev, testStatus: "testing" }))
    try {
      const result = await api.testApiKey(
        step3.hlApiKey.trim(),
        step3.hlApiSecret.trim()
      )
      if (result.valid) {
        setStep3((prev) => ({
          ...prev,
          testStatus: "valid",
          testAddress: result.address,
        }))
        toast({ title: "Connection verified" })
      } else {
        setStep3((prev) => ({
          ...prev,
          testStatus: "invalid",
          testAddress: "",
        }))
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your API key and secret.",
        })
      }
    } catch {
      setStep3((prev) => ({ ...prev, testStatus: "invalid", testAddress: "" }))
      toast({
        variant: "destructive",
        title: "Connection test failed",
        description: "Could not verify credentials. Please try again.",
      })
    }
  }, [step3.hlApiKey, step3.hlApiSecret])

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    async (skipWallet: boolean = false) => {
      if (!skipWallet && !validateStep3()) return

      setIsSubmitting(true)

      // Build a username from the display name
      const username =
        step2.displayName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "") || step1.email.split("@")[0]

      // Split display name into first/last for backend compat
      const nameParts = step2.displayName.trim().split(/\s+/)
      const firstName = nameParts[0] || username
      const lastName = nameParts.slice(1).join(" ") || ""

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            username,
            email: step1.email.trim().toLowerCase(),
            password: step1.password,
            // Extended profile fields (backend can use or ignore)
            profile: {
              displayName: step2.displayName.trim(),
              experienceLevel: step2.experienceLevel,
              riskTolerance: step2.riskTolerance,
              preferredStrategies: step2.preferredStrategies,
              hlApiKey: step3.hlApiKey.trim() || undefined,
              hlApiSecret: step3.hlApiSecret.trim() || undefined,
              initialDeposit: step3.depositAmount
                ? parseFloat(step3.depositAmount)
                : undefined,
            },
          }),
        })

        if (res && res.status >= 400) {
          const { message }: { message?: string } = await res.json()
          throw new Error(message ?? "Registration failed. Please try again.")
        }

        toast({ title: "Account created successfully!" })
        router.push(
          ensureLocalizedPathname(
            redirectPathname
              ? ensureRedirectPathname("/sign-in", redirectPathname)
              : "/sign-in",
            locale
          )
        )
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error instanceof Error ? error.message : undefined,
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [step1, step2, step3, validateStep3, locale, redirectPathname, router]
  )

  // ---------------------------------------------------------------------------
  // Strategy toggle helper
  // ---------------------------------------------------------------------------

  const toggleStrategy = useCallback((name: string) => {
    setStep2((prev) => ({
      ...prev,
      preferredStrategies: prev.preferredStrategies.includes(name)
        ? prev.preferredStrategies.filter((s) => s !== name)
        : [...prev.preferredStrategies, name],
    }))
  }, [])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid gap-4">
      <StepIndicator currentStep={step} />

      {/* ----------------------------------------------------------------- */}
      {/* Step 1: Create Account                                            */}
      {/* ----------------------------------------------------------------- */}
      {step === 1 && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid gap-3">
            {/* Email */}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={step1.email}
                onChange={(e) => {
                  setStep1((prev) => ({ ...prev, email: e.target.value }))
                  if (step1Errors.email)
                    setStep1Errors((prev) => ({ ...prev, email: undefined }))
                }}
              />
              {step1Errors.email && (
                <p className="text-xs text-destructive">{step1Errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters, letter + number"
                value={step1.password}
                onChange={(e) => {
                  setStep1((prev) => ({ ...prev, password: e.target.value }))
                  if (step1Errors.password)
                    setStep1Errors((prev) => ({ ...prev, password: undefined }))
                }}
              />
              {step1Errors.password && (
                <p className="text-xs text-destructive">
                  {step1Errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={step1.confirmPassword}
                onChange={(e) => {
                  setStep1((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                  if (step1Errors.confirmPassword)
                    setStep1Errors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }))
                }}
              />
              {step1Errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {step1Errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms of service */}
            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="terms"
                checked={step1.agreedToTerms}
                onCheckedChange={(checked) => {
                  setStep1((prev) => ({
                    ...prev,
                    agreedToTerms: checked === true,
                  }))
                  if (step1Errors.agreedToTerms)
                    setStep1Errors((prev) => ({
                      ...prev,
                      agreedToTerms: undefined,
                    }))
                }}
              />
              <Label
                htmlFor="terms"
                className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href="#"
                  className="underline text-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="underline text-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {step1Errors.agreedToTerms && (
              <p className="text-xs text-destructive -mt-1">
                {step1Errors.agreedToTerms}
              </p>
            )}
          </div>

          {/* Next button */}
          <Button type="button" className="w-full" onClick={goNext}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>

          <div className="-mt-2 text-center text-sm">
            Already have an account?{" "}
            <Link
              href={ensureLocalizedPathname(
                redirectPathname
                  ? ensureRedirectPathname("/sign-in", redirectPathname)
                  : "/sign-in",
                locale
              )}
              className="underline"
            >
              Sign in
            </Link>
          </div>

          <SeparatorWithText>Or continue with</SeparatorWithText>
          <OAuthLinks />
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 2: Trading Profile                                           */}
      {/* ----------------------------------------------------------------- */}
      {step === 2 && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid gap-3">
            {/* Display Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                type="text"
                placeholder="How others see you"
                value={step2.displayName}
                onChange={(e) => {
                  setStep2((prev) => ({ ...prev, displayName: e.target.value }))
                  if (step2Errors.displayName)
                    setStep2Errors((prev) => ({
                      ...prev,
                      displayName: undefined,
                    }))
                }}
              />
              {step2Errors.displayName && (
                <p className="text-xs text-destructive">
                  {step2Errors.displayName}
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div className="grid gap-1.5">
              <Label>Experience Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["beginner", "intermediate", "advanced"] as const).map(
                  (level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={
                        step2.experienceLevel === level ? "default" : "outline"
                      }
                      size="sm"
                      className="capitalize"
                      onClick={() => {
                        setStep2((prev) => ({
                          ...prev,
                          experienceLevel: level,
                        }))
                        if (step2Errors.experienceLevel)
                          setStep2Errors((prev) => ({
                            ...prev,
                            experienceLevel: undefined,
                          }))
                      }}
                    >
                      {level}
                    </Button>
                  )
                )}
              </div>
              {step2Errors.experienceLevel && (
                <p className="text-xs text-destructive">
                  {step2Errors.experienceLevel}
                </p>
              )}
            </div>

            {/* Risk Tolerance */}
            <div className="grid gap-1.5">
              <Label>Risk Tolerance</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["conservative", "moderate", "aggressive"] as const).map(
                  (level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={
                        step2.riskTolerance === level ? "default" : "outline"
                      }
                      size="sm"
                      className="capitalize"
                      onClick={() => {
                        setStep2((prev) => ({ ...prev, riskTolerance: level }))
                        if (step2Errors.riskTolerance)
                          setStep2Errors((prev) => ({
                            ...prev,
                            riskTolerance: undefined,
                          }))
                      }}
                    >
                      {level}
                    </Button>
                  )
                )}
              </div>
              {step2Errors.riskTolerance && (
                <p className="text-xs text-destructive">
                  {step2Errors.riskTolerance}
                </p>
              )}
            </div>

            {/* Preferred Strategies */}
            <div className="grid gap-2">
              <Label>Preferred Strategies</Label>
              <p className="text-xs text-muted-foreground -mt-1">
                Select the strategies you want to explore. You can change these
                later.
              </p>

              {STRATEGY_TIERS.map((tier) => (
                <div key={tier.tier} className="grid gap-1.5">
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant={tier.variant}
                      className="text-[10px] px-1.5 py-0"
                    >
                      Tier {tier.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {tier.label}
                    </span>
                  </div>

                  <div className="grid gap-1">
                    {tier.strategies.map((strategy) => {
                      const isSelected = step2.preferredStrategies.includes(
                        strategy.name
                      )

                      return (
                        <button
                          key={strategy.name}
                          type="button"
                          onClick={() => toggleStrategy(strategy.name)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors cursor-pointer",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:bg-accent"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium">
                              {strategy.label}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {strategy.description}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={goBack}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={goNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Step 3: Connect Hyperliquid                                       */}
      {/* ----------------------------------------------------------------- */}
      {step === 3 && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid gap-4">
            {/* Hyperliquid API connection */}
            <div className="grid gap-2">
              <Label>Connect Hyperliquid</Label>
              <p className="text-xs text-muted-foreground">
                Enter your Hyperliquid API credentials to start trading. All
                trades are executed securely through our backend.
              </p>

              {step3.testStatus === "valid" ? (
                <div className="flex items-center gap-2 rounded-md border border-primary/50 bg-primary/5 px-3 py-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-primary">
                      Connection verified
                    </p>
                    <p className="truncate text-xs text-muted-foreground font-mono">
                      {step3.testAddress}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* API Key */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="hl-api-key-reg">
                      API Key (Wallet Address)
                    </Label>
                    <Input
                      id="hl-api-key-reg"
                      type="text"
                      placeholder="0x..."
                      value={step3.hlApiKey}
                      onChange={(e) => {
                        setStep3((prev) => ({
                          ...prev,
                          hlApiKey: e.target.value,
                          testStatus: "idle",
                        }))
                      }}
                    />
                  </div>

                  {/* API Secret */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="hl-api-secret-reg">
                      API Secret (Private Key)
                    </Label>
                    <div className="relative">
                      <Input
                        id="hl-api-secret-reg"
                        type={step3.showSecret ? "text" : "password"}
                        placeholder="Your private key"
                        className="pr-10"
                        value={step3.hlApiSecret}
                        onChange={(e) => {
                          setStep3((prev) => ({
                            ...prev,
                            hlApiSecret: e.target.value,
                            testStatus: "idle",
                          }))
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setStep3((prev) => ({
                            ...prev,
                            showSecret: !prev.showSecret,
                          }))
                        }
                        tabIndex={-1}
                      >
                        {step3.showSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {step3.testStatus === "invalid" && (
                    <p className="text-xs text-destructive">
                      Invalid credentials. Please check and try again.
                    </p>
                  )}

                  {/* Test Connection button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2"
                    disabled={
                      step3.testStatus === "testing" ||
                      !step3.hlApiKey ||
                      !step3.hlApiSecret
                    }
                    onClick={testHlConnection}
                  >
                    {step3.testStatus === "testing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </>
              )}

              <p className="text-xs text-muted-foreground">
                Don&apos;t have API credentials? Generate them from your
                Hyperliquid account settings.
              </p>
            </div>

            {/* Deposit amount */}
            <div className="grid gap-1.5">
              <Label htmlFor="deposit-amount">Initial Deposit (USDC)</Label>
              <p className="text-xs text-muted-foreground">
                Optional. Minimum $0.25. You can deposit later from the
                dashboard.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  min="0.25"
                  placeholder="0.00"
                  className="pl-7"
                  value={step3.depositAmount}
                  onChange={(e) => {
                    setStep3((prev) => ({
                      ...prev,
                      depositAmount: e.target.value,
                    }))
                    if (step3Errors.depositAmount)
                      setStep3Errors((prev) => ({
                        ...prev,
                        depositAmount: undefined,
                      }))
                  }}
                />
              </div>
              {step3Errors.depositAmount && (
                <p className="text-xs text-destructive">
                  {step3Errors.depositAmount}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="grid gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={goBack}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <ButtonLoading
                type="button"
                isLoading={isSubmitting}
                className="flex-1"
                onClick={() => handleSubmit(false)}
              >
                Complete Setup
              </ButtonLoading>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
            >
              Skip for now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
