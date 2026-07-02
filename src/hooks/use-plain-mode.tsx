"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "openalgotrade.plain_mode"

export function usePlainMode() {
  // Default ON — grandmother-test path is the default experience.
  const [plainMode, setPlainModeState] = useState<boolean>(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setPlainModeState(stored === "true")
    setHydrated(true)
  }, [])

  const setPlainMode = (next: boolean) => {
    setPlainModeState(next)
    window.localStorage.setItem(STORAGE_KEY, String(next))
  }

  return { plainMode, setPlainMode, hydrated }
}
