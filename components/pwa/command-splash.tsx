"use client"

import { useEffect, useState } from "react"

import { CommandBrandBanner } from "@/components/auth/command-brand-banner"
import { COMMAND_BRAND_BG } from "@/lib/brand-config"

const SPLASH_MS = 1400

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function CommandSplash() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isStandaloneDisplay()) return

    const seen = sessionStorage.getItem("command-splash-seen")
    if (seen) return

    setVisible(true)
    sessionStorage.setItem("command-splash-seen", "1")

    const timer = window.setTimeout(() => setVisible(false), SPLASH_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ backgroundColor: COMMAND_BRAND_BG }}
      aria-hidden
    >
      <div className="w-full max-w-xl">
        <CommandBrandBanner priority />
      </div>
    </div>
  )
}
