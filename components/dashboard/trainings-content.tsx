import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Users,
} from "lucide-react"

import { TrainingsRefreshButton } from "@/components/dashboard/trainings-refresh-button"
import { TrainingsStatusBreakdown } from "@/components/dashboard/trainings-status-breakdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { TRAINING_STATUS_LABELS, formatMonthLabel, formatTrainingMode, getNextRtapMonthKey } from "@/lib/trainings-config"
import { getTrainingsAnalytics } from "@/lib/trainings-analytics"
import type { TrainingsAnalytics, TrainingRecord } from "@/lib/trainings-types"

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function StatusKpiCard({
  label,
  value,
  description,
  icon: Icon,
  className,
}: {
  label: string
  value: number
  description: string
  icon: typeof CheckCircle2
  className: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="size-5" aria-hidden />
          <CardDescription className="font-medium">{label}</CardDescription>
        </div>
        <CardTitle className="text-3xl font-bold tabular-nums sm:text-4xl">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function MonthDistribution({ data }: { data: TrainingsAnalytics }) {
  if (data.monthStats.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classes by Month</CardTitle>
        <CardDescription>Number of classes per RTAP monthly section</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.monthStats.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {item.count.toLocaleString()} · {item.percentage}%
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ModeDistribution({ data }: { data: TrainingsAnalytics }) {
  if (data.modeStats.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mode of Instruction</CardTitle>
        <CardDescription>Face-to-face, online, and hybrid class delivery</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.modeStats.map((item) => (
            <StatChip key={item.name} label={item.name} value={item.count} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function UpcomingTrainingCard({ record }: { record: TrainingRecord }) {
  const mode = formatTrainingMode(record.mode)

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
      <p className="font-semibold leading-snug">{record.activity}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
          {mode}
        </span>
        <span className="text-xs font-medium text-amber-700/90 dark:text-amber-300/90">
          {record.classCount} {record.classCount === 1 ? "class" : "classes"}
        </span>
        <span className="text-xs text-muted-foreground">
          {TRAINING_STATUS_LABELS[record.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {record.proposedSchedule || record.dateOpening || "Schedule pending"}
        {record.venue ? ` · ${record.venue}` : ""}
        {record.opr ? ` · ${record.opr}` : ""}
      </p>
    </div>
  )
}

function getStatusCount(data: TrainingsAnalytics, status: keyof typeof TRAINING_STATUS_LABELS) {
  const label = TRAINING_STATUS_LABELS[status]
  return data.statusStats.find((item) => item.name === label)?.count ?? 0
}

export function TrainingsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-44 max-w-xl rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

export async function TrainingsContent() {
  const data = await getTrainingsAnalytics()
  const nextMonthKey = getNextRtapMonthKey()
  const nextMonthLabel = formatMonthLabel(nextMonthKey)
  const upcomingRecords = data.records.filter((record) => record.month === nextMonthKey)

  const completed = getStatusCount(data, "COMPLETED")
  const ongoing = getStatusCount(data, "ONGOING")
  const toBeOpened = getStatusCount(data, "TO BE OPENED")

  return (
    <div className="relative space-y-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl"
      >
        <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="flex justify-end">
        <TrainingsRefreshButton />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <Card className="gap-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-card">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <GraduationCap className="size-6" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <CardDescription className="font-medium text-primary/80">
                  {data.programYear}
                </CardDescription>
                <CardTitle className="text-4xl font-bold tabular-nums text-primary sm:text-5xl">
                  {data.total.toLocaleString()}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium text-foreground">Total Classes</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatChip label="Unique Programs" value={data.uniquePrograms} />
              <StatChip label="Total Participants" value={data.totalParticipants} />
            </div>
            <div className="space-y-2 rounded-lg border border-primary/20 bg-background/40 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Completion Rate</span>
                <span className="tabular-nums text-primary">{data.completionRate}%</span>
              </div>
              <Progress value={data.completionRate} className="h-2.5 [&>div]:bg-primary" />
              <p className="text-xs text-muted-foreground">
                {completed.toLocaleString()} of {data.total.toLocaleString()} classes completed
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatusKpiCard
            label="Completed"
            value={completed}
            description="Classes with accomplished schedules"
            icon={CheckCircle2}
            className="border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-card text-emerald-700 dark:text-emerald-300 [&_[data-slot=card-description]]:text-emerald-700/90 dark:[&_[data-slot=card-description]]:text-emerald-300/90"
          />
          <StatusKpiCard
            label="Ongoing"
            value={ongoing}
            description="Classes currently in progress"
            icon={LoaderCircle}
            className="border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card text-sky-700 dark:text-sky-300 [&_[data-slot=card-description]]:text-sky-700/90 dark:[&_[data-slot=card-description]]:text-sky-300/90"
          />
          <StatusKpiCard
            label="To Be Opened"
            value={toBeOpened}
            description="Classes scheduled but not yet started"
            icon={CalendarClock}
            className="border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-card text-amber-700 dark:text-amber-300 [&_[data-slot=card-description]]:text-amber-700/90 dark:[&_[data-slot=card-description]]:text-amber-300/90"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.statusStats.length > 0 ? (
          <TrainingsStatusBreakdown items={data.statusStats} records={data.records} />
        ) : null}
        <div className="space-y-4">
          <ModeDistribution data={data} />
          <MonthDistribution data={data} />
        </div>
      </div>

      {data.records.some((record) => record.status === "ONGOING") ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LoaderCircle className="size-5 text-sky-600 dark:text-sky-400" aria-hidden />
              <CardTitle>Ongoing Trainings</CardTitle>
            </div>
            <CardDescription>Active classes as of latest sheet update</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.records
              .filter((record) => record.status === "ONGOING")
              .map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4"
                >
                  <p className="font-semibold leading-snug">{record.activity}</p>
                  <p className="mt-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                    {record.classCount} {record.classCount === 1 ? "class" : "classes"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {record.dateOpening || record.proposedSchedule || "Schedule TBD"}
                    {record.venue ? ` · ${record.venue}` : ""}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      ) : null}

      {data.dataReady ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-amber-600 dark:text-amber-400" aria-hidden />
              <CardTitle>Upcoming Trainings — {nextMonthLabel}</CardTitle>
            </div>
            <CardDescription>
              All trainings scheduled for {nextMonthLabel} · Philippine Standard Time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRecords.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {upcomingRecords.map((record) => (
                  <UpcomingTrainingCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Walang naka-list na training para sa {nextMonthLabel} sa RTAP sheet.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {!data.dataReady ? (
        <Card className="border-dashed border-muted-foreground/25 bg-muted/15">
          <CardContent className="flex items-start gap-3 py-4 text-sm text-muted-foreground">
            <Users className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Walang training data pa. Siguraduhing naka-public ang RTAP Google Sheet at may
              records sa accomplishment monitoring tab.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
