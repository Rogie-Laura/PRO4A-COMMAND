"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#05070f] px-4 text-white">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-700 bg-slate-950/95 p-6 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-slate-300">
          The page could not load. Try again or return to login.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" className="border-slate-600 bg-slate-900" render={<Link href="/login" />}>
            Go to login
          </Button>
        </div>
      </div>
    </div>
  )
}
