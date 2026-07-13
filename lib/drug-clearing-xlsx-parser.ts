import * as XLSX from "xlsx"

import {
  DRUG_CLEARING_PROVINCES,
  type DrugClearingBarangay,
  type DrugClearingBarangayStatus,
  type DrugClearingMunicipality,
  type DrugClearingProvince,
  type DrugClearingRecapRow,
  type ParsedDrugClearingWorkbook,
} from "@/lib/drug-clearing-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const text = String(value ?? "").replace(/,/g, "").trim()
  if (!text) return 0

  const parsed = Number.parseInt(text, 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseFlag(value: unknown) {
  return parseCount(value) > 0
}

function resolveBarangayStatus(row: string[]): DrugClearingBarangayStatus {
  if (parseFlag(row[4])) return "cleared"
  if (parseFlag(row[5])) return "affected"
  if (parseFlag(row[7])) return "drug_free"
  if (parseFlag(row[6])) return "unaffected"
  return "unknown"
}

function isHeaderRow(row: string[]) {
  return row.some((cell) => /BARANGAY/i.test(cell)) && row.some((cell) => /DRUG CLEARED/i.test(cell))
}

function isTotalRow(row: string[]) {
  return (
    /^TOTAL$/i.test(row[0]) ||
    /^TOTAL$/i.test(row[1]) ||
    /^TOTAL$/i.test(row[2])
  )
}

function parseRecapSheet(sheet: XLSX.WorkSheet): DrugClearingRecapRow[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const recap: DrugClearingRecapRow[] = []

  for (const rawRow of rows.slice(1)) {
    if (!Array.isArray(rawRow)) continue

    const row = rawRow.map(normalizeCell)
    const province = row[0]
    if (!province || /^office\/unit$/i.test(province)) continue

    recap.push({
      province,
      citiesMunicipalities: parseCount(row[1]),
      totalBarangays: parseCount(row[2]),
      clearedBarangays: parseCount(row[3]),
      remainingAffected: parseCount(row[4]),
      unaffected: parseCount(row[5]),
      drugFree: parseCount(row[6]),
      isTotal: /^TOTAL$/i.test(province),
    })
  }

  return recap
}

function finalizeMunicipality(
  municipality: DrugClearingMunicipality | null,
  totalRow: string[] | null,
) {
  if (!municipality) return null

  if (totalRow) {
    municipality.totalBarangays = parseCount(totalRow[3]) || municipality.barangays.length
    municipality.cleared = parseCount(totalRow[4])
    municipality.affected = parseCount(totalRow[5])
    municipality.unaffected = parseCount(totalRow[6])
    municipality.drugFree = parseCount(totalRow[7])
  } else {
    municipality.totalBarangays = municipality.barangays.length
    municipality.cleared = municipality.barangays.filter((item) => item.status === "cleared").length
    municipality.affected = municipality.barangays.filter((item) => item.status === "affected").length
    municipality.unaffected = municipality.barangays.filter(
      (item) => item.status === "unaffected",
    ).length
    municipality.drugFree = municipality.barangays.filter((item) => item.status === "drug_free").length
  }

  return municipality
}

function parseProvinceSheet(sheet: XLSX.WorkSheet, provinceName: string): DrugClearingProvince {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  })

  const municipalities: DrugClearingMunicipality[] = []
  let current: DrugClearingMunicipality | null = null
  let inDataSection = false

  for (const rawRow of rows) {
    if (!Array.isArray(rawRow)) continue

    const row = rawRow.map(normalizeCell)
    if (row.every((cell) => !cell)) continue

    if (isHeaderRow(row)) {
      inDataSection = true
      continue
    }

    if (!inDataSection) continue

    if (isTotalRow(row)) {
      const finalized = finalizeMunicipality(current, row)
      if (finalized) {
        municipalities.push(finalized)
      }
      current = null
      continue
    }

    const nr = row[0]
    if (!nr || /^NR$/i.test(nr) || /SUMMARY/i.test(nr)) continue

    const municipalityName = row[2]
    const barangayName = row[3]
    if (!barangayName || /^BARANGAY$/i.test(barangayName)) continue

    if (municipalityName && (!current || municipalityName !== current.name)) {
      if (current) {
        municipalities.push(finalizeMunicipality(current, null)!)
      }

      current = {
        name: municipalityName,
        totalBarangays: 0,
        cleared: 0,
        affected: 0,
        unaffected: 0,
        drugFree: 0,
        barangays: [],
      }
    }

    if (!current) {
      current = {
        name: municipalityName || "Unspecified",
        totalBarangays: 0,
        cleared: 0,
        affected: 0,
        unaffected: 0,
        drugFree: 0,
        barangays: [],
      }
    }

    current.barangays.push({
      name: barangayName,
      status: resolveBarangayStatus(row),
    })
  }

  if (current) {
    municipalities.push(finalizeMunicipality(current, null)!)
  }

  return {
    name: provinceName,
    municipalities,
  }
}

export function parseDrugClearingXlsx(buffer: ArrayBuffer | Buffer): ParsedDrugClearingWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const recapSheet = workbook.Sheets.Recap

  if (!recapSheet) {
    throw new Error('Walang "Recap" sheet sa drug clearing workbook.')
  }

  const recap = parseRecapSheet(recapSheet)
  if (recap.length === 0) {
    throw new Error("Walang valid na recap data sa drug clearing workbook.")
  }

  const provinces: DrugClearingProvince[] = []

  for (const provinceName of DRUG_CLEARING_PROVINCES) {
    const sheet = workbook.Sheets[provinceName]
    if (!sheet) continue

    const province = parseProvinceSheet(sheet, provinceName)
    if (province.municipalities.length > 0) {
      provinces.push(province)
    }
  }

  if (provinces.length === 0) {
    throw new Error("Walang valid na provincial drug clearing data sa workbook.")
  }

  return { recap, provinces }
}
