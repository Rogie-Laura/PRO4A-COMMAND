import {
  RCADD_SECTION_IDS,
  RCADD_SECTION_TITLES,
  type ParsedRcaddWorkbook,
  type RcaddAnalytics,
  type RcaddMetric,
  type RcaddSectionId,
} from "@/lib/rcadd-accomplishment-types"

export function emptyRcaddAnalytics(fileName = ""): RcaddAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    metrics: [],
  }
}

export function buildRcaddAnalyticsFromWorkbook(
  workbook: ParsedRcaddWorkbook,
  meta: { fileName: string; lastUpdated: string },
): RcaddAnalytics {
  return {
    lastUpdated: meta.lastUpdated,
    fileName: meta.fileName,
    dataReady: workbook.metrics.length > 0,
    metrics: workbook.metrics,
  }
}

export function formatRcaddMetricValue(metric: RcaddMetric) {
  if (metric.valueFormat === "percent") {
    return `${(metric.value * 100).toFixed(2)}%`
  }

  return `${Math.round(metric.value).toLocaleString("en-PH")}${metric.unit ? ` ${metric.unit}` : ""}`
}

export function groupRcaddMetrics(metrics: RcaddMetric[]) {
  return RCADD_SECTION_IDS.map((sectionId) => ({
    sectionId: sectionId as RcaddSectionId,
    title: RCADD_SECTION_TITLES[sectionId as RcaddSectionId],
    metrics: metrics.filter((metric) => metric.sectionId === sectionId),
  })).filter((group) => group.metrics.length > 0)
}
