import * as XLSX from "xlsx"

import { MOBILITY_WORKBOOK_SHEETS } from "@/lib/mobility-clearbook-config"
import { parseMobilityWorkbookSheets } from "@/lib/mobility-xlsx-sheets"
import type { ParsedMobilityClearbook, ParsedMobilityWorkbook } from "@/lib/mobility-types"

export function parseMobilityWorkbookXlsx(buffer: ArrayBuffer | Buffer): ParsedMobilityWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })

  const clearbookSheet = workbook.SheetNames.find(
    (name) => name.trim().toUpperCase() === MOBILITY_WORKBOOK_SHEETS.clearbook,
  )

  if (!clearbookSheet) {
    throw new Error(
      `Invalid mobility Excel format. Expected worksheet named "${MOBILITY_WORKBOOK_SHEETS.clearbook}".`,
    )
  }

  return parseMobilityWorkbookSheets(workbook)
}

/** @deprecated Use parseMobilityWorkbookXlsx — kept for compatibility */
export function parseMobilityClearbookXlsx(buffer: ArrayBuffer | Buffer): ParsedMobilityClearbook {
  return parseMobilityWorkbookXlsx(buffer).clearbook
}
