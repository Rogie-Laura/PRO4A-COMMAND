import { formatPhilippinesUploadedAt } from "@/lib/format-datetime"
import { cn } from "@/lib/utils"

type RidSectionHeaderProps = {
  title: string
  description?: string
  uploadedAt?: string | null
  dataReady?: boolean
  /** Hide the title on mobile where the sticky pager bar already shows the section name. */
  hideTitleOnMobile?: boolean
}

export function RidSectionHeader({
  title,
  description,
  uploadedAt,
  dataReady = false,
  hideTitleOnMobile = false,
}: RidSectionHeaderProps) {
  const uploadedLabel =
    dataReady && uploadedAt ? formatPhilippinesUploadedAt(uploadedAt) : null

  return (
    <div>
      <h2 className={cn("text-lg font-semibold", hideTitleOnMobile && "hidden md:block")}>
        {title}
      </h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {uploadedLabel ? (
        <p className="mt-1 text-xs text-muted-foreground">{uploadedLabel}</p>
      ) : null}
    </div>
  )
}

type RidCardUploadedAtProps = {
  uploadedAt?: string | null
  dataReady?: boolean
}

export function RidCardUploadedAt({ uploadedAt, dataReady = false }: RidCardUploadedAtProps) {
  if (!dataReady || !uploadedAt) return null

  const uploadedLabel = formatPhilippinesUploadedAt(uploadedAt)
  if (!uploadedLabel) return null

  return <p className="text-xs text-muted-foreground">{uploadedLabel}</p>
}
