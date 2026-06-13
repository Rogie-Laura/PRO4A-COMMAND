import { formatPhilippinesDateTime } from "@/lib/format-datetime"

type DataSyncBannerProps = {
  lastUpdated: string
  sourceLabel?: string
  syncDescription?: string
}

export function DataSyncBanner({
  lastUpdated,
  sourceLabel,
  syncDescription = "synced from Google Sheet",
}: DataSyncBannerProps) {
  return (
    <div className="rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 shadow-sm backdrop-blur-md dark:border-primary/20 dark:bg-primary/5">
      <p className="text-sm text-foreground">
        Records last updated:{" "}
        <span className="font-semibold">{formatPhilippinesDateTime(lastUpdated)}</span>
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Philippine Standard Time · {syncDescription}
        {sourceLabel ? ` · ${sourceLabel}` : ""}
      </p>
    </div>
  )
}
