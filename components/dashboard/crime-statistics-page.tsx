"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Loader2, Upload } from "lucide-react"

import { CrimeTotalVolumeCard } from "@/components/dashboard/crime-total-volume-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { buildCrimeAnalytics } from "@/lib/crime-analytics"
import { CRIME_ANALYTICS_STORAGE_KEY, type CrimeAnalytics } from "@/lib/crime-types"

function loadStoredAnalytics(): CrimeAnalytics | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.sessionStorage.getItem(CRIME_ANALYTICS_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as CrimeAnalytics
    return parsed.dataReady ? parsed : null
  } catch {
    return null
  }
}

function storeAnalytics(data: CrimeAnalytics) {
  window.sessionStorage.setItem(CRIME_ANALYTICS_STORAGE_KEY, JSON.stringify(data))
}

export function CrimeStatisticsPageContent() {
  const [data, setData] = useState<CrimeAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setData(loadStoredAnalytics())
  }, [])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    setError(null)

    startTransition(async () => {
      try {
        const text = await file.text()
        const analytics = buildCrimeAnalytics(text, file.name)

        if (!analytics.dataReady) {
          setError(
            "Hindi valid ang CSV. Siguraduhing crime data file ito na may ppo, crime, casestatus, at iba pang required columns.",
          )
          return
        }

        storeAnalytics(analytics)
        setData(analytics)
      } catch {
        setError("Hindi mabasa ang file. Subukan ulit gamit ang crime_data CSV export.")
      }
    })
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        disabled={pending}
        onChange={handleFileChange}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {data ? (
        <div className="space-y-3">
          <CrimeTotalVolumeCard data={data} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
          >
            {pending ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Upload data-icon="inline-start" />
            )}
            {pending ? "Parsing…" : "Replace CSV"}
          </Button>
        </div>
      ) : (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 sm:max-w-xl">
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <p className="text-sm text-muted-foreground">
              Walang crime data pa. Upload ang PNP-CIRAS CSV export para makita ang Total Crime
              Volume.
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => fileInputRef.current?.click()}
            >
              {pending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <Upload data-icon="inline-start" />
              )}
              {pending ? "Parsing…" : "Choose CSV"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
