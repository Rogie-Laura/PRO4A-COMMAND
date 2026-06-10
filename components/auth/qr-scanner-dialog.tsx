"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { CameraIcon, ShieldCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type QrScannerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDetected: (value: string) => void
}

type ScannerPhase = "permission" | "starting" | "scanning" | "error"

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Camera permission was blocked. Allow camera access in your browser, then try again."
    }

    if (error.name === "NotFoundError") {
      return "No camera was found on this device."
    }

    if (error.name === "NotReadableError") {
      return "Camera is already in use by another app. Close it and try again."
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes("permission") || message.includes("notallowed")) {
      return "Camera permission was blocked. Allow camera access in your browser, then try again."
    }

    if (message.includes("not found") || message.includes("no camera")) {
      return "No camera was found on this device."
    }
  }

  return "Unable to open the camera. Please try again."
}

export function QrScannerDialog({ open, onOpenChange, onDetected }: QrScannerDialogProps) {
  const scannerId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [phase, setPhase] = useState<ScannerPhase>("permission")
  const [error, setError] = useState<string | null>(null)
  const [cameraRequested, setCameraRequested] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current

    if (!scanner) return

    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }

      scanner.clear()
    } catch {
      // Scanner may already be stopped when dialog closes.
    } finally {
      scannerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setPhase("permission")
      setError(null)
      setCameraRequested(false)
      setRetryKey(0)
      void stopScanner()
    }
  }, [open, stopScanner])

  useEffect(() => {
    if (!open || !cameraRequested) {
      return
    }

    let cancelled = false

    async function startScanner() {
      setPhase("starting")
      setError(null)

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      if (cancelled || !document.getElementById(scannerId)) {
        return
      }

      try {
        await stopScanner()

        const scanner = new Html5Qrcode(scannerId)
        scannerRef.current = scanner

        const cameraConfigs: Array<string | MediaTrackConstraints> = [
          { facingMode: { ideal: "environment" } },
          { facingMode: "environment" },
          { facingMode: "user" },
        ]

        let started = false
        let lastError: unknown = null

        for (const cameraConfig of cameraConfigs) {
          try {
            await scanner.start(
              cameraConfig,
              { fps: 10, qrbox: { width: 220, height: 220 } },
              (decodedText) => {
                onDetected(decodedText)
                onOpenChange(false)
              },
              () => undefined,
            )
            started = true
            break
          } catch (attemptError) {
            lastError = attemptError
          }
        }

        if (!started) {
          throw lastError ?? new Error("Unable to open the camera.")
        }

        if (!cancelled) {
          setPhase("scanning")
        }
      } catch (startError) {
        if (!cancelled) {
          setError(getCameraErrorMessage(startError))
          setPhase("error")
          setCameraRequested(false)
          await stopScanner()
        }
      }
    }

    void startScanner()

    return () => {
      cancelled = true
      void stopScanner()
    }
  }, [cameraRequested, onDetected, onOpenChange, open, retryKey, scannerId, stopScanner])

  function handleAllowCamera() {
    setError(null)
    setPhase("starting")
    setCameraRequested(true)
    setRetryKey((current) => current + 1)
  }

  function handleTryAgain() {
    setError(null)
    setPhase("starting")
    setCameraRequested(true)
    setRetryKey((current) => current + 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point the camera at the login QR from Settings.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {phase === "permission" ? (
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-5 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-sky-500/15 text-sky-400">
                <CameraIcon className="size-7" />
              </div>
              <p className="text-sm font-medium text-white">Camera access needed</p>
              <p className="mt-2 text-sm text-slate-300">
                Tap below to allow camera use for QR scanning only.
              </p>
              <Button className="mt-4 w-full" onClick={handleAllowCamera}>
                <CameraIcon />
                Allow Camera
              </Button>
            </div>
          ) : null}

          {cameraRequested && phase !== "permission" && phase !== "error" ? (
            <div className="relative overflow-hidden rounded-xl border bg-black/90 p-3">
              <div id={scannerId} className="min-h-[260px] w-full" />
              {phase === "starting" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <p className="text-sm text-slate-200">Opening camera...</p>
                </div>
              ) : null}
              {phase === "scanning" ? (
                <p className="mt-3 text-center text-xs text-slate-300">
                  Align the QR code inside the frame.
                </p>
              ) : null}
            </div>
          ) : null}

          {phase === "error" ? (
            <div className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldCheckIcon className="size-7" />
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button className="w-full" onClick={handleTryAgain}>
                Try Again
              </Button>
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QrScanButton({
  onDetected,
}: {
  onDetected: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-slate-600 bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => setOpen(true)}
      >
        <CameraIcon />
        Scan QR Code
      </Button>
      <QrScannerDialog open={open} onOpenChange={setOpen} onDetected={onDetected} />
    </>
  )
}
