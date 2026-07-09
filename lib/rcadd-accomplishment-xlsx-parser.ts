import * as XLSX from "xlsx"

import {
  RCADD_SECTION_TITLES,
  type ParsedRcaddWorkbook,
  type RcaddMetric,
} from "@/lib/rcadd-accomplishment-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const text = String(value ?? "").replace(/,/g, "")
  const match = text.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function parseCountWithUnit(value: unknown) {
  const raw = String(value ?? "")
  const number = parseNumber(raw)
  if (number == null) return null

  const unitMatch = raw.match(/\(([^)]+)\)/i)
  const unit = unitMatch ? unitMatch[1].trim() : undefined

  return { value: number, unit }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function isPeriodLabel(value: string) {
  return /(semester|quarter)/i.test(value)
}

function addMetric(
  metrics: RcaddMetric[],
  input: Omit<RcaddMetric, "sectionTitle">,
) {
  metrics.push({
    ...input,
    sectionTitle: RCADD_SECTION_TITLES[input.sectionId],
  })
}

function parseSummaryMetrics(row: unknown[], metrics: RcaddMetric[]) {
  const mobilizedCount = parseCountWithUnit(row[4])
  const mobilizedRate = parseNumber(row[5])
  const drugCleared = parseCountWithUnit(row[6])
  const lakasHouseholds = parseCountWithUnit(row[7])
  const lakasDecrease = parseNumber(row[8])

  if (mobilizedCount) {
    addMetric(metrics, {
      sectionId: "mobilized_barangays",
      metricKey: "mobilized-count",
      label: "No. of Certified Mobilized Barangays",
      value: mobilizedCount.value,
      valueFormat: "count",
      unit: mobilizedCount.unit ?? "Barangays",
    })
  }

  if (mobilizedRate != null) {
    addMetric(metrics, {
      sectionId: "mobilized_barangays",
      metricKey: "mobilized-rate",
      label: "Percentage of Certified Mobilized Barangays",
      value: mobilizedRate,
      valueFormat: "percent",
    })
  }

  if (drugCleared) {
    addMetric(metrics, {
      sectionId: "drug_cleared_barangays",
      metricKey: "drug-cleared-count",
      label: "No. of Drug Cleared Barangays",
      value: drugCleared.value,
      valueFormat: "count",
      unit: drugCleared.unit ?? "Barangays",
    })
  }

  if (lakasHouseholds) {
    addMetric(metrics, {
      sectionId: "project_lakas",
      metricKey: "lakas-households",
      label: "No. of Households presented with Project L.A.K.A.S audio visual explainer",
      value: lakasHouseholds.value,
      valueFormat: "count",
      unit: lakasHouseholds.unit ?? "Households",
    })
  }

  if (lakasDecrease != null) {
    addMetric(metrics, {
      sectionId: "project_lakas",
      metricKey: "lakas-rape-decrease",
      label: "Percentage decrease in rape incidents",
      value: lakasDecrease,
      valueFormat: "percent",
    })
  }
}

function parseRsriMetrics(rows: unknown[][], metrics: RcaddMetric[]) {
  let currentPenPeriod = normalizeCell(rows[2]?.[0])
  let currentOnlinePeriod = normalizeCell(rows[2]?.[2])

  for (const row of rows.slice(4)) {
    if (!Array.isArray(row)) continue

    const col0 = normalizeCell(row[0])
    const col2 = normalizeCell(row[2])

    if (col2 && isPeriodLabel(col2) && !parseNumber(row[3])) {
      currentOnlinePeriod = col2
      continue
    }

    const penLabel = col0
    const penValue = parseNumber(row[1])
    if (penLabel && penLabel.toLowerCase() !== "perspective" && penValue != null) {
      addMetric(metrics, {
        sectionId: "rsri",
        metricKey: `rsri-pen-${slugify(penLabel)}-${slugify(currentPenPeriod || "default")}`,
        label: penLabel,
        channel: "Pen and Paper",
        period: currentPenPeriod || undefined,
        value: penValue,
        valueFormat: "percent",
      })
    }

    const onlineLabel = col2
    const onlineValue = parseNumber(row[3])
    if (onlineLabel && onlineLabel.toLowerCase() !== "perspective" && onlineValue != null) {
      addMetric(metrics, {
        sectionId: "rsri",
        metricKey: `rsri-online-${slugify(onlineLabel)}-${slugify(currentOnlinePeriod || "default")}`,
        label: onlineLabel,
        channel: "Online Survey",
        period: currentOnlinePeriod || undefined,
        value: onlineValue,
        valueFormat: "percent",
      })
    }
  }
}

export function parseRcaddAccomplishmentXlsx(buffer: ArrayBuffer | Buffer): ParsedRcaddWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const sheet = workbook.Sheets.Sheet1 ?? workbook.Sheets[workbook.SheetNames[0]]

  if (!sheet) {
    throw new Error("Walang worksheet sa RCADD accomplishment file.")
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const metrics: RcaddMetric[] = []

  const summaryRow = rows[2]
  if (Array.isArray(summaryRow)) {
    parseSummaryMetrics(summaryRow, metrics)
  }

  parseRsriMetrics(rows, metrics)

  if (metrics.length === 0) {
    throw new Error("Walang valid na RCADD accomplishment metrics sa workbook.")
  }

  return { metrics }
}
