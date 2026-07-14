import { ICT_OFFICE_UNITS, resolveIctOffice } from "@/lib/ict-equipment-config"
import { ICT_EQUIPMENT_SHEET } from "@/lib/ict-equipment-sheet"
import type {
  IctCybereasonBreakdown,
  IctEquipmentAnalytics,
  IctOfficeBreakdownItem,
  IctPeriodBreakdown,
  IctStatusSection,
  IctStorageBreakdown,
  ParsedIctRecapWorkbook,
} from "@/lib/ict-equipment-types"

export const RECAP_SIMPLIFIED_START_ROW = 18
export const RECAP_UNIT_HEADER = "UNIT"
export const RECAP_TOTAL_ROW = "Total"

const PERIOD_2025_COL = 1
const PERIOD_JAN_2026_COL = 2
const PERIOD_TOTAL_COL = 3
const GRAND_TOTAL_2025_COL = 7
const GRAND_TOTAL_JAN_2026_COL = 8
const GRAND_TOTAL_TOTAL_COL = 9
const CYBER_INSTALLED_COL = 12
const CYBER_WITHOUT_COL = 14
const CYBER_TOTAL_COL = 16
const STORAGE_HDD_COL = 18
const STORAGE_SSD_COL = 19
const STORAGE_TOTAL_COL = 20

const BLOCK_KEYS = [
  "serviceable",
  "unserviceable",
  "ber",
  "pnpIssuedByNhq",
  "procuredByPro",
] as const

type BlockKey = (typeof BLOCK_KEYS)[number]

const BLOCK_TITLE_TO_KEY: Record<string, BlockKey> = {
  serviceable: "serviceable",
  unserviceable: "unserviceable",
  ber: "ber",
  "pnp issued by nhq": "pnpIssuedByNhq",
  "procured by pro": "procuredByPro",
}

function normalizeCell(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\r\n/g, " ")
    .replace(/\s+/g, " ")
}

function parseNumber(value: unknown) {
  const trimmed = String(value ?? "")
    .replace(/,/g, "")
    .trim()
  if (!trimmed || trimmed.startsWith("#")) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function parsePeriodBreakdown(cells: string[]): IctPeriodBreakdown | null {
  const year2025Below = parseNumber(cells[PERIOD_2025_COL])
  const asOfJanuary2026 = parseNumber(cells[PERIOD_JAN_2026_COL]) ?? 0

  if (year2025Below === null) {
    return null
  }

  let total = parseNumber(cells[PERIOD_TOTAL_COL])
  if (total === null) {
    total = year2025Below + asOfJanuary2026
  }

  return { year2025Below, asOfJanuary2026, total }
}

function parseGrandTotalBreakdown(cells: string[]): IctPeriodBreakdown | null {
  const year2025Below = parseNumber(cells[GRAND_TOTAL_2025_COL])
  const asOfJanuary2026 = parseNumber(cells[GRAND_TOTAL_JAN_2026_COL]) ?? 0
  let total = parseNumber(cells[GRAND_TOTAL_TOTAL_COL])

  if (year2025Below === null) {
    return null
  }

  if (total === null) {
    total = year2025Below + asOfJanuary2026
  }

  return { year2025Below, asOfJanuary2026, total }
}

function parseCybereasonBreakdown(cells: string[]): IctCybereasonBreakdown | null {
  const installed = parseNumber(cells[CYBER_INSTALLED_COL])
  const without = parseNumber(cells[CYBER_WITHOUT_COL]) ?? 0
  let total = parseNumber(cells[CYBER_TOTAL_COL])

  if (installed === null) {
    return null
  }

  if (total === null) {
    total = installed + without
  }

  return { installed, without, total }
}

function parseStorageBreakdown(cells: string[]): IctStorageBreakdown | null {
  const hddOrHybrid = parseNumber(cells[STORAGE_HDD_COL])
  const ssdOnly = parseNumber(cells[STORAGE_SSD_COL]) ?? 0
  let total = parseNumber(cells[STORAGE_TOTAL_COL])

  if (hddOrHybrid === null) {
    return null
  }

  if (total === null) {
    total = hddOrHybrid + ssdOnly
  }

  return { hddOrHybrid, ssdOnly, total }
}

function normalizeBlockTitle(value: string) {
  return value.trim().toLowerCase()
}

function resolveBlockKey(title: string): BlockKey | null {
  return BLOCK_TITLE_TO_KEY[normalizeBlockTitle(title)] ?? null
}

function emptyStatusSection(label: string, detail: string): IctStatusSection {
  return {
    label,
    breakdown: { year2025Below: 0, asOfJanuary2026: 0, total: 0 },
    detail,
    offices: [],
  }
}

export function emptyIctEquipmentAnalytics(fileName = ""): IctEquipmentAnalytics {
  const emptyBreakdown = { year2025Below: 0, asOfJanuary2026: 0, total: 0 }

  return {
    lastUpdated: new Date().toISOString(),
    dataReady: false,
    dataSource: fileName || ICT_EQUIPMENT_SHEET.label,
    grandTotal: {
      label: "Total ICT Equipment",
      breakdown: emptyBreakdown,
    },
    serviceable: emptyStatusSection(
      "Serviceable ICT Equipment",
      "Walang data mula sa RECAP Serviceable block",
    ),
    unserviceable: emptyStatusSection(
      "Unserviceable ICT Equipment",
      "Walang data mula sa RECAP Unserviceable block",
    ),
    ber: emptyStatusSection(
      "Beyond Economic Repair (BER)",
      "Walang data mula sa RECAP BER block",
    ),
    pnpIssuedByNhq: emptyStatusSection(
      "PNP Issued by NHQ",
      "Walang data mula sa RECAP PNP Issued by NHQ block",
    ),
    procuredByPro: emptyStatusSection(
      "Procured by PRO",
      "Walang data mula sa RECAP Procured by PRO block",
    ),
  }
}

function buildOfficeBreakdown(
  rows: Array<{
    unit: string
    breakdown: IctPeriodBreakdown
    cybereason?: IctCybereasonBreakdown
    storage?: IctStorageBreakdown
  }>,
): IctOfficeBreakdownItem[] {
  const rowByUnit = new Map(rows.map((row) => [row.unit, row]))

  return ICT_OFFICE_UNITS.flatMap((unit) => {
    const office = resolveIctOffice(unit)
    const row = rowByUnit.get(unit)
    if (!office || !row) return []

    return [
      {
        subUnit: office.subUnit,
        label: office.label,
        shortLabel: office.shortLabel,
        logo: office.logo,
        colorClass: office.colorClass,
        count: row.breakdown.total,
        breakdown: row.breakdown,
        cybereason: row.cybereason,
        storage: row.storage,
      },
    ]
  })
}

type ParsedBlock = {
  key: BlockKey
  breakdown: IctPeriodBreakdown
  offices: IctOfficeBreakdownItem[]
  cybereason?: IctCybereasonBreakdown
  storage?: IctStorageBreakdown
}

function parseRecapBlocks(rows: string[][]): {
  blocks: Partial<Record<BlockKey, ParsedBlock>>
  grandTotal: IctPeriodBreakdown | null
} {
  const blocks: Partial<Record<BlockKey, ParsedBlock>> = {}
  let grandTotal: IctPeriodBreakdown | null = null

  for (let index = RECAP_SIMPLIFIED_START_ROW; index < rows.length; index++) {
    const header = rows[index]
    if (header[0]?.trim() !== RECAP_UNIT_HEADER) continue

    const blockKey = resolveBlockKey(header[1] ?? "")
    if (!blockKey) continue

    const officeRows: Array<{
      unit: string
      breakdown: IctPeriodBreakdown
      cybereason?: IctCybereasonBreakdown
      storage?: IctStorageBreakdown
    }> = []

    let totalBreakdown: IctPeriodBreakdown | null = null
    let blockCybereason: IctCybereasonBreakdown | undefined
    let blockStorage: IctStorageBreakdown | undefined

    for (let rowIndex = index + 1; rowIndex < rows.length; rowIndex++) {
      const cells = rows[rowIndex]
      const unit = cells[0]?.trim()
      if (!unit) continue

      if (unit === RECAP_UNIT_HEADER) break
      if (unit.toLowerCase() === "grand total") break

      if (unit === RECAP_TOTAL_ROW) {
        totalBreakdown = parsePeriodBreakdown(cells)
        if (blockKey === "serviceable" && !grandTotal) {
          grandTotal = parseGrandTotalBreakdown(cells)
          blockCybereason = parseCybereasonBreakdown(cells) ?? undefined
          blockStorage = parseStorageBreakdown(cells) ?? undefined
        }
        break
      }

      if (!ICT_OFFICE_UNITS.includes(unit as (typeof ICT_OFFICE_UNITS)[number])) {
        continue
      }

      const breakdown = parsePeriodBreakdown(cells)
      if (!breakdown) continue

      officeRows.push({
        unit,
        breakdown,
        cybereason:
          blockKey === "serviceable" ? (parseCybereasonBreakdown(cells) ?? undefined) : undefined,
        storage:
          blockKey === "serviceable" ? (parseStorageBreakdown(cells) ?? undefined) : undefined,
      })
    }

    if (officeRows.length !== ICT_OFFICE_UNITS.length || !totalBreakdown) {
      continue
    }

    blocks[blockKey] = {
      key: blockKey,
      breakdown: totalBreakdown,
      offices: buildOfficeBreakdown(officeRows),
      cybereason: blockCybereason,
      storage: blockStorage,
    }
  }

  return { blocks, grandTotal }
}

const SECTION_META: Record<
  BlockKey,
  { label: string; detail: string }
> = {
  serviceable: {
    label: "Serviceable ICT Equipment",
    detail: "Serviceable · RECAP simplified block · PRO CALABARZON",
  },
  unserviceable: {
    label: "Unserviceable ICT Equipment",
    detail: "Unserviceable · RECAP simplified block · PRO CALABARZON",
  },
  ber: {
    label: "Beyond Economic Repair (BER)",
    detail: "BER · RECAP simplified block · PRO CALABARZON",
  },
  pnpIssuedByNhq: {
    label: "PNP Issued by NHQ",
    detail: "PNP Issued by NHQ · RECAP simplified block · PRO CALABARZON",
  },
  procuredByPro: {
    label: "Procured by PRO",
    detail: "Procured by PRO · RECAP simplified block · PRO CALABARZON",
  },
}

export function buildIctEquipmentAnalyticsFromRows(
  rows: string[][],
  options: { fileName: string; lastUpdated: string },
): IctEquipmentAnalytics {
  const { blocks, grandTotal } = parseRecapBlocks(rows)

  const hasAllBlocks = BLOCK_KEYS.every((key) => blocks[key])
  if (!hasAllBlocks || !grandTotal) {
    return emptyIctEquipmentAnalytics(options.fileName)
  }

  const sections = Object.fromEntries(
    BLOCK_KEYS.map((key) => {
      const block = blocks[key]!
      const meta = SECTION_META[key]
      return [
        key,
        {
          label: meta.label,
          breakdown: block.breakdown,
          detail: meta.detail,
          offices: block.offices,
          cybereason: block.cybereason,
          storage: block.storage,
        } satisfies IctStatusSection,
      ]
    }),
  ) as Pick<IctEquipmentAnalytics, BlockKey>

  return {
    lastUpdated: options.lastUpdated,
    dataReady: true,
    dataSource: options.fileName,
    grandTotal: {
      label: "Total ICT Equipment",
      breakdown: grandTotal,
    },
    ...sections,
  }
}

export function buildIctEquipmentAnalyticsFromWorkbook(
  workbook: ParsedIctRecapWorkbook,
  options: { fileName: string; lastUpdated: string },
): IctEquipmentAnalytics {
  return {
    ...workbook.analytics,
    dataSource: options.fileName,
    lastUpdated: options.lastUpdated,
  }
}
