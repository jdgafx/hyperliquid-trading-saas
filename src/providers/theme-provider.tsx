"use client"

import { useEffect } from "react"

import type { ReactNode } from "react"

import { themes } from "@/configs/themes"

import { useIsDarkMode } from "@/hooks/use-mode"
import { useSettings } from "@/hooks/use-settings"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const isDarkMode = useIsDarkMode()

  useEffect(() => {
    const bodyElement = document.body

    // Update class names in the <body> tag
    Array.from(bodyElement.classList)
      .filter(
        (className) =>
          className.startsWith("theme-") || className.startsWith("radius-")
      )
      .forEach((className) => {
        bodyElement.classList.remove(className)
      })

    bodyElement.classList.add(`theme-${settings.theme}`)
    bodyElement.classList.add(`radius-${settings.radius ?? 0.5}`)

    // Apply theme-tinted sidebar colors
    const theme = themes[settings.theme as keyof typeof themes]
    if (theme) {
      const hsl = isDarkMode ? theme.activeColor.dark : theme.activeColor.light
      // Parse hue and saturation from the HSL string "H S% L%"
      const [h, s] = hsl.split(" ")
      // Set sidebar to a tinted background based on the theme color
      const sidebarBg = isDarkMode ? "0 0% 2%" : `${h} ${s} 97%`
      const sidebarAccent = isDarkMode ? `${h} ${s} 12%` : `${h} ${s} 93%`
      const sidebarForeground = isDarkMode
        ? theme.activeColor.foreground
        : `${h} ${s} 10%`

      const root = document.documentElement
      root.style.setProperty("--sidebar-background", sidebarBg)
      root.style.setProperty("--sidebar-primary", hsl)
      root.style.setProperty("--sidebar-accent", sidebarAccent)
      root.style.setProperty("--sidebar-accent-foreground", sidebarForeground)
      root.style.setProperty("--sidebar-foreground", sidebarForeground)
    }
  }, [settings.theme, settings.radius, isDarkMode])

  return <>{children}</>
}
