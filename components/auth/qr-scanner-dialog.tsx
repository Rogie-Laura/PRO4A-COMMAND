"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { CameraIcon } from "lucide-react"

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

export function QrScannerDialog({ open, onOpenChange, onDetected }: QrScannerDialogProps) {
  const scannerId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (!open) {
      void stopScanner()
      return
    }

    let cancelled = false

    async function startScanner() {
      setError(null)
      setStarting(true)

      try {
        const scanner = new Html5Qrcode(scannerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (cancelled) return
            onDetected(decodedText)
            onOpenChange(false)
          },
          () => undefined,
        )
      } catch (startError) {
        if (!cancelled) {
          setError(
            startError instanceof Error
              ? startError.message
              : "Hindi mabuksan ang camera. Payagan ang camera permission.",
          )
        }
      } finally {
        if (!cancelled) {
          setStarting(false)
        }
      }
    }

    void startScanner()

    return () => {
      cancelled = true
      void stopScanner()
    }
  }, [open, onDetected, onOpenChange, scannerId])

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>I-scan ang QR</DialogTitle>
          <DialogDescription>
            Itutok ang camera sa QR code na ibinigay ng admin. Automatic na papasok pag
            nakuha ang code.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-black/90 p-3">
            <div id={scannerId} className="min-h-[260px] w-full" />
          </div>
          {starting ? (
            <p className="text-center text-sm text-muted-foreground">Binubuksan ang camera...</p>
          ) : null}
          {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
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
