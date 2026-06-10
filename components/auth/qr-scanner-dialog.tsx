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
type ScanMode = "html5" | "native"

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>
}

type BarcodeDetectorConstructor = new (options: {
  formats: string[]
}) => BarcodeDetectorLike

function isAndroidChrome() {
  if (typeof navigator === "undefined") return false

  const userAgent = navigator.userAgent
  return /Android/i.test(userAgent) && /Chrome/i.test(userAgent)
}

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

    if (message.includes("notreadable") || message.includes("could not start video")) {
      return "Camera is busy or blocked. Close other camera apps, then try again."
    }
  }

  return "Unable to open the camera. Please try again."
}

async function buildCameraStartConfigs() {
  const configs: Array<string | MediaTrackConstraints> = []

  try {
    const cameras = await Html5Qrcode.getCameras()
    const backPattern = /back|rear|environment|wide/i
    const frontPattern = /front|user|selfie|face/i

    const backCameras = cameras.filter((camera) => backPattern.test(camera.label))
    const frontCameras = cameras.filter((camera) => frontPattern.test(camera.label))
    const otherCameras = cameras.filter(
      (camera) => !backPattern.test(camera.label) && !frontPattern.test(camera.label),
    )

    for (const camera of [...backCameras, ...otherCameras, ...frontCameras]) {
      configs.push(camera.id)
    }
  } catch {
    // Fall back to facingMode constraints below.
  }

  configs.push(
    { facingMode: { ideal: "environment" } },
    { facingMode: "environment" },
    { facingMode: { ideal: "user" } },
    { facingMode: "user" },
  )

  return configs
}

async function startNativeQrScan(
  videoEl: HTMLVideoElement,
  onDetected: (value: string) => void,
) {
  const BarcodeDetectorCtor = (
    window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }
  ).BarcodeDetector

  if (!BarcodeDetectorCtor) {
    throw new Error("QR scanning is not supported on this browser.")
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  })

  videoEl.srcObject = stream
  videoEl.setAttribute("playsinline", "true")
  videoEl.muted = true
  await videoEl.play()

  const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] })
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    stream.getTracks().forEach((track) => track.stop())
    throw new Error("Unable to start the camera preview.")
  }

  let stopped = false
  let frameId = 0

  const scanFrame = async () => {
    if (stopped) return

    if (videoEl.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      canvas.width = videoEl.videoWidth
      canvas.height = videoEl.videoHeight
      context.drawImage(videoEl, 0, 0, canvas.width, canvas.height)

      try {
        const codes = await detector.detect(canvas)
        const match = codes.find((code) => code.rawValue)

        if (match?.rawValue) {
          stopped = true
          onDetected(match.rawValue)
          return
        }
      } catch {
        // Keep scanning until a QR code is found.
      }
    }

    if (!stopped) {
      frameId = window.requestAnimationFrame(() => {
        void scanFrame()
      })
    }
  }

  frameId = window.requestAnimationFrame(() => {
    void scanFrame()
  })

  return () => {
    stopped = true
    window.cancelAnimationFrame(frameId)
    stream.getTracks().forEach((track) => track.stop())
    videoEl.srcObject = null
  }
}

export function QrScannerDialog({ open, onOpenChange, onDetected }: QrScannerDialogProps) {
  const scannerId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const nativeCleanupRef = useRef<(() => void) | null>(null)
  const isStartingRef = useRef(false)
  const [phase, setPhase] = useState<ScannerPhase>("permission")
  const [error, setError] = useState<string | null>(null)
  const [scanMode, setScanMode] = useState<ScanMode | null>(null)

  const stopScanner = useCallback(async () => {
    nativeCleanupRef.current?.()
    nativeCleanupRef.current = null

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
      setScanMode(null)
      isStartingRef.current = false
      void stopScanner()
    }
  }, [open, stopScanner])

  const startScanner = useCallback(async () => {
    if (isStartingRef.current) return

    isStartingRef.current = true
    setPhase("starting")
    setError(null)
    setScanMode(null)

    try {
      await stopScanner()

      if (isAndroidChrome() && videoRef.current) {
        setScanMode("native")

        nativeCleanupRef.current = await startNativeQrScan(videoRef.current, (decodedText) => {
          onDetected(decodedText)
          onOpenChange(false)
        })

        setPhase("scanning")
        return
      }

      const mountElement = document.getElementById(scannerId)

      if (!mountElement) {
        throw new Error("Scanner is not ready yet. Close the dialog and try again.")
      }

      setScanMode("html5")

      const scanner = new Html5Qrcode(scannerId, {
        useBarCodeDetectorIfSupported: false,
        verbose: false,
      })
      scannerRef.current = scanner

      const cameraConfigs = await buildCameraStartConfigs()
      let started = false
      let lastError: unknown = null

      for (const cameraConfig of cameraConfigs) {
        try {
          await scanner.start(
            cameraConfig,
            {
              fps: 10,
              qrbox: (viewfinderWidth, viewfinderHeight) => {
                const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7)
                return { width: Math.max(size, 180), height: Math.max(size, 180) }
              },
            },
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

          try {
            if (scanner.isScanning) {
              await scanner.stop()
            }

            scanner.clear()
          } catch {
            // Try the next camera configuration.
          }
        }
      }

      if (!started) {
        throw lastError ?? new Error("Unable to open the camera.")
      }

      setPhase("scanning")
    } catch (startError) {
      if (isAndroidChrome() && videoRef.current && "BarcodeDetector" in window) {
        try {
          await stopScanner()
          setScanMode("native")

          nativeCleanupRef.current = await startNativeQrScan(videoRef.current, (decodedText) => {
            onDetected(decodedText)
            onOpenChange(false)
          })

          setPhase("scanning")
          return
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setError(getCameraErrorMessage(startError))
      setPhase("error")
      setScanMode(null)
      await stopScanner()
    } finally {
      isStartingRef.current = false
    }
  }, [onDetected, onOpenChange, scannerId, stopScanner])

  function handleAllowCamera() {
    void startScanner()
  }

  function handleTryAgain() {
    void startScanner()
  }

  const showScannerPreview = open && phase !== "permission" && phase !== "error"

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
          {open ? (
            <div className={showScannerPreview ? "relative overflow-hidden rounded-xl border bg-black/90 p-3" : "sr-only"}>
              <div
                id={scannerId}
                className={scanMode === "html5" ? "min-h-[260px] w-full" : "hidden"}
              />
              <video
                ref={videoRef}
                className={
                  scanMode === "native"
                    ? "min-h-[260px] w-full rounded-lg object-cover"
                    : "hidden"
                }
                autoPlay
                muted
                playsInline
              />
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
