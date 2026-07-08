"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"

import { loginWithAccessKeyAction } from "@/app/login/actions"
import { CommandBrandBanner } from "@/components/auth/command-brand-banner"
import { QrScanButton } from "@/components/auth/qr-scanner-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { normalizeAccessKeyInput } from "@/lib/auth/parse-access-key"
import { formatServerActionError } from "@/lib/server-action-errors"

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
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    const keyFromUrl = searchParams.get("key") ?? searchParams.get("t")

    if (!keyFromUrl || autoLoginAttempted.current) return

    autoLoginAttempted.current = true
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
        const result = await loginWithAccessKeyAction(normalized, rememberDevice, nextPath)

        if (result?.error) {
          setError(result.error)
        }
      } catch (loginError) {
        if (isNextRedirect(loginError)) {
          throw loginError
        }

        setError(formatServerActionError(loginError, "Invalid access key."))
      }
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitLogin(accessKey)
  }

  return (
    <div className="min-h-dvh bg-[#05070f] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_40%)]" />

      <div className="relative mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="w-full">
          <CommandBrandBanner priority />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950/95 p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white">Login</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label htmlFor="access-key" className="text-sm font-medium text-slate-100">
                Access Key
              </label>
              <Input
                id="access-key"
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                placeholder="pk_..."
                className="h-11 border-slate-600 bg-slate-900 font-mono text-white placeholder:text-slate-400"
                disabled={isPending}
                autoComplete="off"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-100">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(event) => setRememberDevice(event.target.checked)}
                className="size-4 rounded border-slate-500 bg-slate-900"
                disabled={isPending}
              />
              <span>Remember this device</span>
            </label>

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={isPending || !accessKey.trim()}
            >
              {isPending ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-3 text-slate-300">or</span>
            </div>
          </div>

          <QrScanButton
            onDetected={(value) => {
              setAccessKey(value)
              submitLogin(value)
            }}
          />
        </div>
      </div>
    </div>
  )
}
