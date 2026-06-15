"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { FileSpreadsheet, Loader2, Upload } from "lucide-react"

import { CrimeVolumeSection } from "@/components/dashboard/crime-volume-section"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buildCrimeAnalytics } from "@/lib/crime-analytics"
import { CRIME_ANALYTICS_STORAGE_KEY, type CrimeAnalytics } from "@/lib/crime-types"
import { formatPhilippinesDateTime } from "@/lib/format-datetime"

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

  function handleClearData() {
    window.sessionStorage.removeItem(CRIME_ANALYTICS_STORAGE_KEY)
    setData(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-primary/25 bg-primary/5">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <FileSpreadsheet className="size-5" aria-hidden />
              <CardDescription className="text-primary/90">PNP-CIRAS export</CardDescription>
            </div>
            <CardTitle className="text-xl">Upload crime data</CardTitle>
            <CardDescription>CSV export mula sa PNP-CIRAS</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={pending}
              onChange={handleFileChange}
            />
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
              {pending ? "Parsing…" : data ? "Replace CSV" : "Choose CSV"}
            </Button>
            {data ? (
              <Button type="button" variant="ghost" onClick={handleClearData}>
                Clear data
              </Button>
            ) : null}
          </div>
        </CardHeader>
        {data ? (
          <CardContent className="text-sm text-muted-foreground">
            Loaded: <span className="font-medium text-foreground">{data.fileName}</span> ·{" "}
            {formatPhilippinesDateTime(data.lastUpdated)} Philippine Standard Time
          </CardContent>
        ) : null}
        {error ? (
          <CardContent className="text-sm text-destructive">{error}</CardContent>
        ) : null}
      </Card>

      {data ? (
        <CrimeVolumeSection data={data} />
      ) : (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15 sm:max-w-xl">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Walang crime data pa. Upload ang PNP-CIRAS CSV export para makita ang Total Crime
            Volume.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
