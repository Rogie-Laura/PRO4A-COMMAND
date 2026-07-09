import {
  BarChart3,
  Building2,
  HandHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatRcaddMetricValue,
  groupRcaddMetrics,
} from "@/lib/rcadd-accomplishment-analytics"
import type { RcaddAnalytics, RcaddSectionId } from "@/lib/rcadd-accomplishment-types"
import { cn } from "@/lib/utils"

type RcaddSectionCardsProps = {
  analytics: RcaddAnalytics
}

const SECTION_STYLES: Record<
  RcaddSectionId,
  { icon: LucideIcon; borderClass: string; iconClass: string }
> = {
  rsri: {
    icon: HandHeart,
    borderClass: "border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-card to-card",
    iconClass: "text-sky-600 dark:text-sky-400",
  },
  mobilized_barangays: {
    icon: Building2,
    borderClass: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  drug_cleared_barangays: {
    icon: ShieldCheck,
    borderClass: "border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card",
    iconClass: "text-violet-600 dark:text-violet-400",
  },
  project_lakas: {
    icon: Sparkles,
    borderClass: "border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
}

function RsriCard({ analytics }: { analytics: RcaddAnalytics }) {
  const group = groupRcaddMetrics(analytics.metrics).find((item) => item.sectionId === "rsri")

  if (!group || group.metrics.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Regional Satisfaction & Respect Index</CardTitle>
          <CardDescription>
            Walang RSRI data pa. Mag-upload ng RCADD accomplishment workbook sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const penMetrics = group.metrics.filter((metric) => metric.channel === "Pen and Paper")
  const onlineMetrics = group.metrics.filter((metric) => metric.channel === "Online Survey")
  const penPeriod = penMetrics[0]?.period
  const onlinePeriods = [...new Set(onlineMetrics.map((metric) => metric.period).filter(Boolean))]

  const { icon: Icon, borderClass, iconClass } = SECTION_STYLES.rsri

  return (
    <Card className={borderClass}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className={cn("size-5", iconClass)} />
              {group.title}
            </CardTitle>
            <CardDescription>
              Pen and Paper ({penPeriod}) · Online Survey ({onlinePeriods.join(" · ")})
            </CardDescription>
          </div>
          <Badge variant="outline">{group.metrics.length} perspectives</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-lg border bg-background/70">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Pen and Paper</th>
                  <th className="w-28 px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {penMetrics.map((metric) => (
                  <tr key={metric.metricKey} className="border-b last:border-0">
                    <td className="px-4 py-3 leading-relaxed">{metric.label}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRcaddMetricValue(metric)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-background/70">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Online Survey</th>
                  <th className="w-32 px-4 py-3 font-medium">Period</th>
                  <th className="w-28 px-4 py-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {onlineMetrics.map((metric) => (
                  <tr key={metric.metricKey} className="border-b last:border-0">
                    <td className="px-4 py-3 leading-relaxed">{metric.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">{metric.period}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatRcaddMetricValue(metric)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryMetricCard({
  sectionId,
  title,
  metrics,
}: {
  sectionId: Exclude<RcaddSectionId, "rsri">
  title: string
  metrics: RcaddAnalytics["metrics"]
}) {
  const { icon: Icon, borderClass, iconClass } = SECTION_STYLES[sectionId]

  if (metrics.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Walang data pa. Mag-upload ng RCADD accomplishment workbook sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={borderClass}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={cn("size-5", iconClass)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div
            key={metric.metricKey}
            className="rounded-lg border border-muted-foreground/15 bg-background/70 px-4 py-4"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {formatRcaddMetricValue(metric)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RcaddSectionCards({ analytics }: RcaddSectionCardsProps) {
  if (!analytics.dataReady || analytics.metrics.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            RCADD Accomplishment
          </CardTitle>
          <CardDescription>
            Walang RCADD accomplishment data pa. Mag-upload ng RCADD ACCOMPLISHMENT FOR PRO 4A
            COMMAND DASHBOARD.xlsx sa Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const groups = groupRcaddMetrics(analytics.metrics)

  return (
    <div className="space-y-4">
      <RsriCard analytics={analytics} />
      {groups
        .filter((group) => group.sectionId !== "rsri")
        .map((group) => (
          <SummaryMetricCard
            key={group.sectionId}
            sectionId={group.sectionId as Exclude<RcaddSectionId, "rsri">}
            title={group.title}
            metrics={group.metrics}
          />
        ))}
    </div>
  )
}
