import type {
  IntelEligibilityAnalytics,
  IntelEligibilityMetricKey,
  IntelEligibilityMetricSummary,
  IntelEligibilityStrength,
  IntelEligibilityUnitRow,
  ParsedIntelEligibilityWorkbook,
} from "@/lib/intel-eligibility-types"

const METRIC_META: Array<{
  key: IntelEligibilityMetricKey
  label: string
  shortLabel: string
}> = [
  {
    key: "authorized",
    label: "Authorized Strength",
    shortLabel: "Authorized",
  },
  {
    key: "actual",
    label: "Actual Strength (A)",
    shortLabel: "Actual (A)",
  },
  {
    key: "withTraining",
    label: "With Intel Training (B)",
    shortLabel: "Training (B)",
  },
  {
    key: "withSeminar",
    label: "With Intel Seminar (C)",
    shortLabel: "Seminar (C)",
  },
  {
    key: "withoutTrainingSeminar",
    label: "Without Training & Seminar (D)",
    shortLabel: "No Training (D)",
  },
  {
    key: "trainingNotInPosition",
    label: "Training but Not in Intel Position",
    shortLabel: "Not in Position",
  },
]

export function emptyIntelEligibilityStrength(): IntelEligibilityStrength {
  return { pco: 0, pnco: 0, nup: 0, total: 0 }
}

export function emptyIntelEligibilityAnalytics(fileName = ""): IntelEligibilityAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    title: "Intelligence Eligibility List",
    periodLabel: "",
    note: "",
    units: [],
    metrics: [],
  }
}

function strengthFromRows(
  units: IntelEligibilityUnitRow[],
  key: IntelEligibilityMetricKey,
): IntelEligibilityStrength {
  const totalRow = units.find((row) => row.isTotal)
  if (totalRow) {
    return { ...totalRow[key] }
  }

  return units.reduce(
    (acc, row) => {
      const strength = row[key]
      return {
        pco: acc.pco + strength.pco,
        pnco: acc.pnco + strength.pnco,
        nup: acc.nup + strength.nup,
        total: acc.total + strength.total,
      }
    },
    emptyIntelEligibilityStrength(),
  )
}

export function buildIntelEligibilityAnalyticsFromWorkbook(
  workbook: ParsedIntelEligibilityWorkbook,
  options: { fileName: string; lastUpdated: string },
): IntelEligibilityAnalytics {
  if (workbook.units.length === 0) {
    return emptyIntelEligibilityAnalytics(options.fileName)
  }

  const metrics: IntelEligibilityMetricSummary[] = METRIC_META.map((meta) => ({
    key: meta.key,
    label: meta.label,
    shortLabel: meta.shortLabel,
    totals: strengthFromRows(workbook.units, meta.key),
    unitRows: workbook.units,
  }))

  return {
    lastUpdated: options.lastUpdated,
    fileName: options.fileName,
    dataReady: true,
    title: workbook.title || "Intelligence Eligibility List",
    periodLabel: workbook.periodLabel,
    note: workbook.note,
    units: workbook.units,
    metrics,
  }
}
