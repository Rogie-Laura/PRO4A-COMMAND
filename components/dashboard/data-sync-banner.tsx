import { formatPhilippinesDateTime } from "@/lib/format-datetime"

type DataSyncBannerProps = {
  lastUpdated: string
}

export function DataSyncBanner({ lastUpdated }: DataSyncBannerProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-sm text-foreground">
        Records last updated:{" "}
        <span className="font-semibold">{formatPhilippinesDateTime(lastUpdated)}</span>
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Philippine Standard Time · synced from Google Sheet
      </p>
    </div>
  )
}
