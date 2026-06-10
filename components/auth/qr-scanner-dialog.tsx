"use client"

import { useEffect, useId, useRef, useState } from "react"
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

export function QrScannerDialog({ open, onOpenChange, onDetected }: QrScannerDialogProps) {
  const scannerId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [phase, setPhase] = useState<ScannerPhase>("permission")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setPhase("permission")
      setError(null)
      void stopScanner()
    }
  }, [open])

  async function stopScanner() {
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
  }

  async function requestCameraPermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera is not supported on this browser.")
      setPhase("error")
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })

      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch {
      setError("Camera permission was blocked. Allow camera access in browser settings, then try again.")
      setPhase("error")
      return false
    }
  }

  async function startScanner() {
    setError(null)
    setPhase("starting")

    const allowed = await requestCameraPermission()

    if (!allowed) {
      return
    }

    try {
      const scanner = new Html5Qrcode(scannerId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          onDetected(decodedText)
          onOpenChange(false)
        },
        () => undefined,
      )

      setPhase("scanning")
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to open the camera. Please try again.",
      )
      setPhase("error")
      await stopScanner()
    }
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
              <Button className="mt-4 w-full" onClick={() => void startScanner()}>
                <CameraIcon />
                Allow Camera
              </Button>
            </div>
          ) : null}

          {phase === "starting" ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border bg-black/90 p-3">
              <p className="text-sm text-slate-300">Opening camera...</p>
            </div>
          ) : null}

          {phase === "scanning" ? (
            <div className="overflow-hidden rounded-xl border bg-black/90 p-3">
              <div id={scannerId} className="min-h-[260px] w-full" />
              <p className="mt-3 text-center text-xs text-slate-300">
                Align the QR code inside the frame.
              </p>
            </div>
          ) : null}

          {phase === "error" ? (
            <div className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldCheckIcon className="size-7" />
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button className="w-full" onClick={() => void startScanner()}>
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
