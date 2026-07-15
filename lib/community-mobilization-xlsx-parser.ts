import * as XLSX from "xlsx"

import {
  COMMUNITY_MOBILIZATION_PROVINCES,
  type CommunityMobilizationBarangay,
  type CommunityMobilizationMunicipality,
  type CommunityMobilizationProvince,
  type CommunityMobilizationProvinceName,
  type CommunityMobilizationRecapRow,
  type ParsedCommunityMobilizationWorkbook,
} from "@/lib/community-mobilization-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value)
  }

  const text = String(value ?? "")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .trim()
  if (!text) return 0

  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

function parsePercent(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    // Excel may store 0.4521 or 45.21
    return value <= 1 ? Math.round(value * 1000) / 10 : Math.round(value * 10) / 10
  }

  const text = String(value ?? "").trim()
  if (!text) return null
  const cleaned = text.replace(/%/g, "").replace(/,/g, "")
  const parsed = Number.parseFloat(cleaned)
  if (!Number.isFinite(parsed)) return null
  return Math.round(parsed * 10) / 10
}

function normalizeKey(value: string) {
  return value
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
}

/** Strip station suffixes so "Alfonso MPS" matches list sheet "Alfonso". */
function normalizeMunicipalityKey(value: string) {
  return normalizeKey(
    value
      .replace(/\b(CCPS|CPS|MPS|PS|C\/MPS)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim(),
  )
}

function titleCaseMunicipality(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      if (/^(mps|cps|ps|c\/mps)$/i.test(part)) return part.toUpperCase()
      if (part.includes("/")) {
        return part
          .split("/")
          .map((bit) => (bit ? bit.charAt(0).toUpperCase() + bit.slice(1) : ""))
          .join("/")
      }
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join(" ")
}

function isSkipBarangayName(name: string) {
  if (!name) return true
  return /^(nr|city\/municipality|list of|mobilized municipality|certified mobilized municipality|total)$/i.test(
    name,
  )
}

function findSheet(workbook: XLSX.WorkBook, matcher: (name: string) => boolean) {
  const found = workbook.SheetNames.find((name) => matcher(name.trim()))
  return found ? workbook.Sheets[found]! : null
}

function parseRecapSheet(sheet: XLSX.WorkSheet): CommunityMobilizationRecapRow[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const recap: CommunityMobilizationRecapRow[] = []

  for (const rawRow of rows) {
    if (!Array.isArray(rawRow)) continue
    const province = normalizeCell(rawRow[0])
    if (!province || /^ppo$/i.test(province)) continue

    const yearBreakdown: Record<string, number> = {}
    for (let year = 2018; year <= 2026; year += 1) {
      const col = year - 2018 + 2
      yearBreakdown[String(year)] = parseCount(rawRow[col])
    }

    recap.push({
      province,
      totalBarangays: parseCount(rawRow[1]),
      mobilized: parseCount(rawRow[11]),
      remaining: parseCount(rawRow[13]),
      compliancePct: parsePercent(rawRow[12]),
      yearBreakdown,
      isTotal: /^total$/i.test(province),
    })
  }

  return recap
}

function parseStandardProvinceSheet(sheet: XLSX.WorkSheet): CommunityMobilizationMunicipality[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const municipalities: CommunityMobilizationMunicipality[] = []

  for (const rawRow of rows) {
    if (!Array.isArray(rawRow)) continue
    const name = normalizeCell(rawRow[0])
    if (!name || /^(ccps\/mps|c\/mps|total)$/i.test(name)) continue

    const totalBarangays = parseCount(rawRow[1])
    const mobilized = parseCount(rawRow[11])
    const remaining = parseCount(rawRow[13])
    const compliancePct = parsePercent(rawRow[12])

    municipalities.push({
      name: titleCaseMunicipality(name),
      totalBarangays,
      mobilized,
      remaining: remaining || Math.max(0, totalBarangays - mobilized),
      compliancePct,
      barangays: [],
    })
  }

  return municipalities
}

/** Laguna uses aggregated 2018–2025 + monthly 2026 columns. */
function parseLagunaProvinceSheet(sheet: XLSX.WorkSheet): CommunityMobilizationMunicipality[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const municipalities: CommunityMobilizationMunicipality[] = []

  for (const rawRow of rows) {
    if (!Array.isArray(rawRow)) continue
    const name = normalizeCell(rawRow[0])
    if (!name || /^(c\/mps|total)$/i.test(name)) continue
    // Skip spacer / month header rows with no barangay count
    if (!normalizeCell(rawRow[1]) && !normalizeCell(rawRow[16])) continue

    const totalBarangays = parseCount(rawRow[1])
    const mobilized = parseCount(rawRow[16])
    const remaining = parseCount(rawRow[18])
    const compliancePct = parsePercent(rawRow[17])

    if (totalBarangays === 0 && mobilized === 0) continue

    municipalities.push({
      name: titleCaseMunicipality(name),
      totalBarangays,
      mobilized,
      remaining: remaining || Math.max(0, totalBarangays - mobilized),
      compliancePct,
      barangays: [],
    })
  }

  return municipalities
}

function parseListSheet(
  sheet: XLSX.WorkSheet,
): Map<string, { displayName: string; barangays: CommunityMobilizationBarangay[] }> {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  })

  const byMunicipality = new Map<
    string,
    { displayName: string; barangays: CommunityMobilizationBarangay[] }
  >()
  let seenHeader = false

  for (const rawRow of rows) {
    if (!Array.isArray(rawRow)) continue
    const cells = rawRow.map(normalizeCell)

    if (
      cells.some((cell) => /city\/municipality/i.test(cell)) &&
      cells.some((cell) => /mobilized barangay/i.test(cell))
    ) {
      seenHeader = true
      continue
    }

    if (!seenHeader) continue

    const municipality = cells[1]
    if (!municipality || /^nr$/i.test(municipality)) continue

    const key = normalizeMunicipalityKey(municipality)
    if (!key) continue

    const bucket = byMunicipality.get(key) ?? {
      displayName: titleCaseMunicipality(municipality),
      barangays: [],
    }
    const mobilizedName = cells[2]
    const notYetName = cells[3]

    if (!isSkipBarangayName(mobilizedName)) {
      bucket.barangays.push({ name: mobilizedName, status: "mobilized" })
    }
    if (!isSkipBarangayName(notYetName)) {
      bucket.barangays.push({ name: notYetName, status: "not_yet_mobilized" })
    }

    byMunicipality.set(key, bucket)
  }

  return byMunicipality
}

function mergeMunicipalityLists(
  summary: CommunityMobilizationMunicipality[],
  lists: Map<string, { displayName: string; barangays: CommunityMobilizationBarangay[] }>,
): CommunityMobilizationMunicipality[] {
  const usedKeys = new Set<string>()
  const merged = summary.map((muni) => {
    const key = normalizeMunicipalityKey(muni.name)
    usedKeys.add(key)
    const listEntry = lists.get(key)
    const barangays = listEntry?.barangays ?? []
    const mobilizedFromList = barangays.filter((b) => b.status === "mobilized").length
    const remainingFromList = barangays.filter((b) => b.status === "not_yet_mobilized").length

    return {
      ...muni,
      barangays,
      mobilized: muni.mobilized || mobilizedFromList,
      remaining: muni.remaining || remainingFromList,
      totalBarangays:
        muni.totalBarangays ||
        (mobilizedFromList + remainingFromList > 0
          ? mobilizedFromList + remainingFromList
          : muni.totalBarangays),
    }
  })

  for (const [key, entry] of lists) {
    if (usedKeys.has(key) || entry.barangays.length === 0) continue
    const mobilized = entry.barangays.filter((b) => b.status === "mobilized").length
    const remaining = entry.barangays.filter((b) => b.status === "not_yet_mobilized").length
    merged.push({
      name: entry.displayName,
      totalBarangays: mobilized + remaining,
      mobilized,
      remaining,
      compliancePct:
        mobilized + remaining > 0
          ? Math.round((mobilized / (mobilized + remaining)) * 1000) / 10
          : null,
      barangays: entry.barangays,
    })
  }

  return merged.sort((a, b) => a.name.localeCompare(b.name))
}

function extractAsOfLabel(workbook: XLSX.WorkBook): string | null {
  for (const name of workbook.SheetNames) {
    if (!/list/i.test(name)) continue
    const sheet = workbook.Sheets[name]
    if (!sheet) continue
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    })
    const title = normalizeCell(rows[0]?.[0])
    const match = title.match(/as of\s+(.+)$/i) ?? title.match(/as\s+(.+)$/i)
    if (match?.[1]) return match[1].replace(/,?\s*$/, "").trim()
  }
  return null
}

function buildProvince(
  provinceName: CommunityMobilizationProvinceName,
  workbook: XLSX.WorkBook,
): CommunityMobilizationProvince {
  const summarySheet =
    findSheet(workbook, (name) => normalizeKey(name) === normalizeKey(provinceName)) ??
    findSheet(
      workbook,
      (name) =>
        normalizeKey(name).startsWith(normalizeKey(provinceName)) && !/list/i.test(name),
    )

  const listSheet = findSheet(
    workbook,
    (name) => /list/i.test(name) && normalizeKey(name).includes(normalizeKey(provinceName)),
  )

  const summary =
    provinceName === "Laguna" && summarySheet
      ? parseLagunaProvinceSheet(summarySheet)
      : summarySheet
        ? parseStandardProvinceSheet(summarySheet)
        : []

  const lists = listSheet ? parseListSheet(listSheet) : new Map()

  return {
    name: provinceName,
    municipalities: mergeMunicipalityLists(summary, lists),
  }
}

export function parseCommunityMobilizationXlsx(
  buffer: ArrayBuffer | Buffer,
): ParsedCommunityMobilizationWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })

  const recapSheet = findSheet(workbook, (name) => /^recap$/i.test(name))
  if (!recapSheet) {
    throw new Error("Hindi mahanap ang RECAP sheet sa CMP workbook.")
  }

  const recap = parseRecapSheet(recapSheet)
  if (recap.length === 0) {
    throw new Error("Walang valid na RECAP rows sa CMP workbook.")
  }

  const provinces = COMMUNITY_MOBILIZATION_PROVINCES.map((province) =>
    buildProvince(province, workbook),
  ).filter((province) => province.municipalities.length > 0)

  if (provinces.length === 0) {
    throw new Error("Walang valid na province / barangay data sa CMP workbook.")
  }

  return {
    asOfLabel: extractAsOfLabel(workbook),
    recap,
    provinces,
  }
}
