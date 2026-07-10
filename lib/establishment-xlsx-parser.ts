import * as XLSX from "xlsx"

import {
  ESTABLISHMENT_PROVINCE_SHEETS,
  type EstablishmentProvince,
  type ParsedEstablishmentRecord,
  type ParsedEstablishmentWorkbook,
} from "@/lib/establishment-types"

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  const text = String(value ?? "").replace(/,/g, "").trim()
  const match = text.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function isPhilippinesLatitude(value: number) {
  return value >= 4 && value <= 21
}

function isPhilippinesLongitude(value: number) {
  return value >= 116 && value <= 127
}

function resolveCoordinates(a: unknown, b: unknown) {
  const first = parseNumber(a)
  const second = parseNumber(b)

  if (first == null || second == null) {
    return null
  }

  if (isPhilippinesLatitude(first) && isPhilippinesLongitude(second)) {
    return { latitude: first, longitude: second }
  }

  if (isPhilippinesLongitude(first) && isPhilippinesLatitude(second)) {
    return { latitude: second, longitude: first }
  }

  return null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const PROVINCE_PPO: Record<EstablishmentProvince, string> = {
  Cavite: "CPPO",
  Laguna: "LPPO",
  Batangas: "BPPO",
  Rizal: "RPPO",
  Quezon: "QPPO",
}

function normalizePpo(value: string, province: EstablishmentProvince) {
  const normalized = value.trim().toUpperCase()

  if (normalized === "CPPO") return "CPPO"
  if (normalized === "LPPO") return "LPPO"
  if (normalized === "RPPO") return "RPPO"
  if (normalized === "QPPO") return "QPPO"
  if (normalized.includes("BATANGAS") || normalized === "BATANGAS") return "BPPO"

  return PROVINCE_PPO[province]
}

function detectColumns(header: unknown[]) {
  const labels = header.map((cell) => normalizeCell(cell).toUpperCase())

  return {
    typeIdx: labels.findIndex((label) => label.includes("TYPE OF ESTABLISHMENT")),
    nameIdx: labels.findIndex((label) => label.includes("NAME OF ESTABLISHMENT")),
    locationIdx: labels.findIndex((label) => label.includes("LOCATION")),
    contactIdx: labels.findIndex((label) => label.includes("CONTACT")),
    sectorIdx: labels.findIndex((label) => label.includes("SECTOR")),
  }
}

function parseProvinceSheet(
  province: EstablishmentProvince,
  rows: unknown[][],
): { records: ParsedEstablishmentRecord[]; skippedRows: number } {
  const records: ParsedEstablishmentRecord[] = []
  let skippedRows = 0

  const columns = detectColumns(rows[0] ?? [])
  if (
    columns.typeIdx < 0 ||
    columns.nameIdx < 0 ||
    columns.locationIdx < 0 ||
    columns.contactIdx < 0
  ) {
    throw new Error(`Hindi mabasa ang header ng ${province} sheet.`)
  }

  for (const row of rows.slice(1)) {
    if (!Array.isArray(row)) continue

    const ppoRaw = normalizeCell(row[0])
    const station = normalizeCell(row[1])
    const coordinates = resolveCoordinates(row[2], row[3])
    const sectorNo =
      columns.sectorIdx >= 0 ? normalizeCell(row[columns.sectorIdx]) : ""
    const establishmentType = normalizeCell(row[columns.typeIdx])
    const name = normalizeCell(row[columns.nameIdx])
    const location = normalizeCell(row[columns.locationIdx])
    const contactPerson = normalizeCell(row[columns.contactIdx])

    const required = [ppoRaw, station, establishmentType, name, location, contactPerson]
    if (required.some((value) => !value) || !coordinates) {
      skippedRows++
      continue
    }

    records.push({
      province,
      ppo: normalizePpo(ppoRaw, province),
      station,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      sectorNo,
      establishmentType,
      name,
      location,
      contactPerson,
    })
  }

  return { records, skippedRows }
}

export function parseEstablishmentXlsx(buffer: ArrayBuffer | Buffer): ParsedEstablishmentWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
  const records: ParsedEstablishmentRecord[] = []
  let skippedRows = 0

  for (const province of ESTABLISHMENT_PROVINCE_SHEETS) {
    const sheet = workbook.Sheets[province]
    if (!sheet) {
      throw new Error(`Kulang ang ${province} sheet sa establishment workbook.`)
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    })

    const parsed = parseProvinceSheet(province, rows)
    records.push(...parsed.records)
    skippedRows += parsed.skippedRows
  }

  if (records.length === 0) {
    throw new Error("Walang valid na establishment records sa workbook.")
  }

  return { records, skippedRows }
}

export function establishmentTypeKey(establishmentType: string) {
  return slugify(establishmentType) || "unknown"
}
