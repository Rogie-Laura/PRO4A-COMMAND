"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Clock3, Loader2 } from "lucide-react"

import { fetchDetailedPersonnelStatusRecords } from "@/app/(dashboard)/actions"
import { DetailedPersonnelStatusDetailSheet } from "@/components/dashboard/detailed-personnel-status-detail-sheet"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DETAILED_ORDER_EXPIRY_WINDOW_DAYS,
  type DetailedPersonnelRecordWithSource,
  type DetailedPersonnelStatusCounts,
} from "@/lib/detailed-personnel-status"
import { cn } from "@/lib/utils"

type DetailedPersonnelStatusSectionProps = {
  status: DetailedPersonnelStatusCounts
}

type StatusView = "expiring" | "terminated" | null

export function DetailedPersonnelStatusSection({ status }: DetailedPersonnelStatusSectionProps) {
  const [activeView, setActiveView] = useState<StatusView>(null)
  const [records, setRecords] = useState<DetailedPersonnelRecordWithSource[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingType, setLoadingType] = useState<StatusView>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpenChange(open: boolean) {
    if (!open) {
      setActiveView(null)
      setRecords([])
      setError(null)
    }
  }

  function handleStatusClick(type: StatusView) {
    if (!type || isPending) return

    setError(null)
    setLoadingType(type)
    startTransition(async () => {
      try {
        const list = await fetchDetailedPersonnelStatusRecords(type)
        setRecords(list)
        setActiveView(type)
      } catch {
        setError("Hindi ma-load ang personnel list. Subukan muli.")
      } finally {
        setLoadingType(null)
      }
    })
  }

  const dialogConfig =
    activeView === "expiring"
      ? {
          title: `Expiring Within ${DETAILED_ORDER_EXPIRY_WINDOW_DAYS} Days`,
          description: `${status.expiringCount.toLocaleString()} personnel whose detailed order expires soon`,
        }
      : activeView === "terminated"
        ? {
            title: "Terminated Detailed Orders",
            description: `${status.terminatedCount.toLocaleString()} personnel with terminated detail orders`,
          }
        : null

  const expiringCard = (
    <StatusCard
      icon={Clock3}
      label={`Expiring Within ${DETAILED_ORDER_EXPIRY_WINDOW_DAYS} Days`}
      description="Personnel whose detailed order expires in 15 days or less"
      count={status.expiringCount}
      loading={loadingType === "expiring"}
      accentClassName="border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-card text-amber-700 dark:text-amber-300 [&_[data-slot=card-description]]:text-amber-700/90 dark:[&_[data-slot=card-description]]:text-amber-300/90"
      onClick={() => handleStatusClick("expiring")}
    />
  )

  const terminatedCard = (
    <StatusCard
      icon={AlertTriangle}
      label="Terminated Detailed Orders"
      description="Personnel whose detailed orders are already terminated"
      count={status.terminatedCount}
      loading={loadingType === "terminated"}
      accentClassName="border-red-500/30 bg-gradient-to-br from-red-500/15 via-red-500/5 to-card text-red-700 dark:text-red-300 [&_[data-slot=card-description]]:text-red-700/90 dark:[&_[data-slot=card-description]]:text-red-300/90"
      onClick={() => handleStatusClick("terminated")}
    />
  )

  return (
    <>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <SwipeCarousel
        className="lg:hidden"
        swipeHint="Swipe for Expiring · Terminated"
        ariaLabel="Detailed order status"
        slides={[
          {
            id: "detailed-expiring",
            label: `Expiring Within ${DETAILED_ORDER_EXPIRY_WINDOW_DAYS} Days`,
            dotClassName: "bg-amber-500",
            content: expiringCard,
          },
          {
            id: "detailed-terminated",
            label: "Terminated Detailed Orders",
            dotClassName: "bg-red-500",
            content: terminatedCard,
          },
        ]}
      />

      <div className="hidden gap-4 sm:grid-cols-2 lg:grid">
        {expiringCard}
        {terminatedCard}
      </div>

      {activeView && dialogConfig ? (
        <DetailedPersonnelStatusDetailSheet
          title={dialogConfig.title}
          description={dialogConfig.description}
          records={records}
          open={activeView !== null}
          onOpenChange={handleOpenChange}
        />
      ) : null}
    </>
  )
}

type StatusCardProps = {
  icon: typeof Clock3
  label: string
  description: string
  count: number
  loading?: boolean
  accentClassName: string
  onClick: () => void
}

function StatusCard({
  icon: Icon,
  label,
  description,
  count,
  loading = false,
  accentClassName,
  onClick,
}: StatusCardProps) {
  const isClickable = count > 0

  return (
    <button
      type="button"
      disabled={!isClickable || loading}
      onClick={onClick}
      className={cn(
        "text-left",
        isClickable &&
          !loading &&
          "cursor-pointer transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        (!isClickable || loading) && "cursor-default opacity-70",
      )}
    >
      <Card className={cn("h-full gap-0", accentClassName)}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Icon className="size-5" aria-hidden />
            )}
            <CardDescription className="font-medium">{label}</CardDescription>
          </div>
          <CardTitle className="text-4xl font-bold tabular-nums sm:text-5xl">
            {count.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-foreground">Number of Personnel</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {isClickable ? (
            <p className="mt-2 text-xs font-medium text-foreground/80">
              {loading ? "Loading personnel list..." : "Tap to view personnel list"}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </button>
  )
}
