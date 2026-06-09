"use client"

import { useEffect, useState } from "react"
import { DownloadIcon, ShareIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const DISMISS_KEY = "pro4a-install-dismissed"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone() {
  if (typeof window === "undefined") return false

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isIos() {
  if (typeof window === "undefined") return false

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function PwaShell() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === "1") return

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Install prompt may still work on some browsers without SW.
      })
    }

    if (isIos()) {
      setShowIosHint(true)
      setVisible(true)
      return
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm sm:rounded-xl sm:border">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          {showIosHint ? (
            <ShareIcon className="size-5 text-primary" />
          ) : (
            <DownloadIcon className="size-5 text-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install PRO4A COMMAND</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {showIosHint
              ? "Sa iPhone: tap Share, then Add to Home Screen para mabilis buksan ang app."
              : "I-install ang dashboard para mabilis buksan mula sa home screen."}
          </p>

          {!showIosHint && (
            <Button size="sm" className="mt-3" onClick={handleInstall}>
              Install app
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon-sm" onClick={dismiss} aria-label="Dismiss install prompt">
          <XIcon />
        </Button>
      </div>
    </div>
  )
}
