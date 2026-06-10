"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { KeyRoundIcon, SmartphoneIcon, SparklesIcon } from "lucide-react"

import { loginWithAccessKeyAction } from "@/app/login/actions"
import { QrScanButton } from "@/components/auth/qr-scanner-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { normalizeAccessKeyInput } from "@/lib/auth/parse-access-key"

function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  )
}

export function LoginScreen() {
  const searchParams = useSearchParams()
  const [accessKey, setAccessKey] = useState("")
  const [rememberDevice, setRememberDevice] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const keyFromUrl = searchParams.get("key") ?? searchParams.get("t")

    if (!keyFromUrl) return

    setAccessKey(keyFromUrl)
    window.history.replaceState({}, "", "/login")
    submitLogin(keyFromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when QR link opens login
  }, [searchParams])

  function submitLogin(keyValue: string) {
    setError(null)

    startTransition(async () => {
      try {
        const normalized = normalizeAccessKeyInput(keyValue)
        const nextPath = searchParams.get("next") ?? "/"
        await loginWithAccessKeyAction(normalized, rememberDevice, nextPath)
      } catch (loginError) {
        if (isNextRedirect(loginError)) {
          throw loginError
        }

        setError(
          loginError instanceof Error
            ? loginError.message
            : "Hindi makapasok. Paki-try ulit o kontakin ang admin.",
        )
      }
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitLogin(accessKey)
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(to_bottom,_#0b1020,_#05070f)] px-4 py-8">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <Image src="/logos/PRO4A.png" alt="PRO4A" width={48} height={48} className="size-12" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">PRO4A COMMAND</h1>
          <p className="mt-2 text-sm text-white/70">
            Isang beses lang ang setup. Sunod, click na lang ang icon sa phone o laptop.
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-5 text-primary" />
              Pasok sa Dashboard
            </CardTitle>
            <CardDescription>
              Piliin ang pinakamadali para sa iyo. Hindi kailangan ng username at password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  <span className="font-semibold">Unang beses:</span> ilagay ang access key o
                  i-scan ang QR, tapos i-click ang <strong>Pasok</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <SmartphoneIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  <span className="font-semibold">Sunod na araw:</span> buksan lang ang PRO4A icon
                  sa home screen. Automatic na papasok.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="access-key" className="text-sm font-medium">
                  Access Key
                </label>
                <Input
                  id="access-key"
                  value={accessKey}
                  onChange={(event) => setAccessKey(event.target.value)}
                  placeholder="pk_..."
                  className="h-11 font-mono"
                  disabled={isPending}
                  autoComplete="off"
                />
              </div>

              <label className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  className="mt-1 size-4 rounded border-input"
                  disabled={isPending}
                />
                <span>
                  <span className="font-medium">Tandaan ang device na ito</span>
                  <span className="mt-1 block text-muted-foreground">
                    Recommended para sa boss. Hindi na kailangan mag-login ulit araw-araw.
                  </span>
                </span>
              </label>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" className="h-11 w-full text-base" disabled={isPending || !accessKey.trim()}>
                {isPending ? "Sinusuri..." : "Pasok sa PRO4A COMMAND"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o mas madali pa</span>
              </div>
            </div>

            <QrScanButton
              onDetected={(value) => {
                setAccessKey(value)
                submitLogin(value)
              }}
            />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/50">
          Kung hindi makapasok, kontakin ang admin para sa bagong QR o access key.
        </p>
      </div>
    </div>
  )
}
