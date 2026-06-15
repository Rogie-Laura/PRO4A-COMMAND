import type { CrimeAnalytics } from "@/lib/crime-types"
import type { CountItem } from "@/lib/personnel-types"

const EXPECTED_HEADERS = [
  "ppo",
  "stn",
  "barangay",
  "year",
  "typeofplace",
  "datereported",
  "datecommitted",
  "timecommitted",
  "crime",
  "category",
  "victim",
  "suspect",
  "narrative",
  "casestatus",
  "lat",
  "lng",
] as const

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

function parseCsvRows(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => parseCsvLine(line).map((value) => value.trim()))
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase()
}

function isCrimeDataSheet(headers: string[]) {
  const normalized = headers.map(normalizeHeader)
  return EXPECTED_HEADERS.every((header) => normalized.includes(header))
}

function buildCountItems(counts: Map<string, number>, total: number): CountItem[] {
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function emptyAnalytics(fileName = ""): CrimeAnalytics {
  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: false,
    year: null,
    totalVolume: 0,
    ppoBreakdown: [],
    crimeBreakdown: [],
    statusBreakdown: [],
  }
}

export function buildCrimeAnalytics(csvText: string, fileName: string): CrimeAnalytics {
  const rows = parseCsvRows(csvText)
  if (rows.length < 2) {
    return emptyAnalytics(fileName)
  }

  const headers = rows[0].map(normalizeHeader)
  if (!isCrimeDataSheet(headers)) {
    return emptyAnalytics(fileName)
  }

  const ppoIndex = headers.indexOf("ppo")
  const yearIndex = headers.indexOf("year")
  const crimeIndex = headers.indexOf("crime")
  const statusIndex = headers.indexOf("casestatus")

  const ppoCounts = new Map<string, number>()
  const crimeCounts = new Map<string, number>()
  const statusCounts = new Map<string, number>()
  let year: number | null = null
  let totalVolume = 0

  for (const row of rows.slice(1)) {
    const ppo = row[ppoIndex]?.trim()
    const crime = row[crimeIndex]?.trim()
    const status = row[statusIndex]?.trim()

    if (!ppo || !crime) continue

    totalVolume += 1

    const yearValue = Number.parseInt(row[yearIndex] ?? "", 10)
    if (!year && Number.isFinite(yearValue)) {
      year = yearValue
    }

    ppoCounts.set(ppo, (ppoCounts.get(ppo) ?? 0) + 1)
    crimeCounts.set(crime, (crimeCounts.get(crime) ?? 0) + 1)

    if (status) {
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    }
  }

  if (totalVolume === 0) {
    return emptyAnalytics(fileName)
  }

  return {
    lastUpdated: new Date().toISOString(),
    fileName,
    dataReady: true,
    year,
    totalVolume,
    ppoBreakdown: buildCountItems(ppoCounts, totalVolume),
    crimeBreakdown: buildCountItems(crimeCounts, totalVolume),
    statusBreakdown: buildCountItems(statusCounts, totalVolume),
  }
}
