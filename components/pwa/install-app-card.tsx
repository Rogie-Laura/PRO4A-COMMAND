"use client"

import { useEffect, useState } from "react"
import { CheckCircle2Icon, DownloadIcon, ShareIcon, SmartphoneIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type BeforeInstallPromptEvent,
  isIosDevice,
  isStandalonePwa,
  registerServiceWorker,
} from "@/lib/pwa"

export function InstallAppCard() {
  const [installed, setInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    registerServiceWorker()
    setIsIos(isIosDevice())
    setInstalled(isStandalonePwa())
    setReady(true)

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === "accepted") {
      setInstalled(true)
    }

    setDeferredPrompt(null)
  }

  if (!ready) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Install App</CardTitle>
          <CardDescription>Add PRO4A COMMAND to your home screen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-16 animate-pulse rounded-lg bg-muted/50" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            {installed ? (
              <CheckCircle2Icon className="size-5 text-primary" />
            ) : isIos ? (
              <ShareIcon className="size-5 text-primary" />
            ) : (
              <DownloadIcon className="size-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <CardTitle>Install App</CardTitle>
            <CardDescription>Add PRO4A COMMAND to your home screen</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {installed ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
            <CheckCircle2Icon className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary">Already installed</p>
              <p className="text-xs text-muted-foreground">
                PRO4A COMMAND is on your home screen.
              </p>
            </div>
          </div>
        ) : isIos ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium">Sa iPhone / iPad</p>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Buksan ang site sa Safari</li>
              <li>Tap ang Share button</li>
              <li>Piliin ang Add to Home Screen</li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              I-install ang dashboard para mabilis buksan mula sa home screen — parang native
              app, walang browser bar.
            </p>
            <Button onClick={handleInstall}>
              <SmartphoneIcon data-icon="inline-start" />
              Install app
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Para ma-install, buksan ang site sa Chrome o Edge. Kung naka-install na sa browser
              menu, lalabas dito ang Already installed pagkatapos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
