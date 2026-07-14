import {
  buildDetailedPersonnelStatusSummary,
} from "@/lib/detailed-personnel-status"
import {
  buildDetailedPersonnelAnalyticsFromRecords,
  toDetailedPersonnelSummary,
} from "@/lib/detailed-personnel-analytics"
import { DETAILED_PERSONNEL_SHEET } from "@/lib/detailed-personnel-sheet"
import type { DetailedPersonnelTabKey } from "@/lib/detailed-personnel-types"
import { buildPersonnelAnalyticsFromRecords } from "@/lib/personnel-aggregations"
import type { ParsedRprmdWorkbook, RprmdWorkbookPayload } from "@/lib/rprmd-workbook-types"
import { getDetailedTabLabel } from "@/lib/rprmd-workbook-xlsx-parser"
import { buildSchoolingAnalyticsFromRecords } from "@/lib/schooling-analytics"
import { SCHOOLING_SHEET } from "@/lib/schooling-sheet"

export function buildRprmdWorkbookPayload(
  workbook: ParsedRprmdWorkbook,
  options: { fileName: string; lastUpdated: string },
): RprmdWorkbookPayload {
  const personnelBase = buildPersonnelAnalyticsFromRecords(workbook.personnelRecords, {
    includeRankTenureDetails: false,
  })
  const personnel = {
    ...personnelBase,
    lastUpdated: options.lastUpdated,
  }

  const mandatorySchooling = buildSchoolingAnalyticsFromRecords(
    SCHOOLING_SHEET.mandatoryLabel,
    workbook.mandatorySchooling,
    options,
  )

  const specializedSchooling = buildSchoolingAnalyticsFromRecords(
    SCHOOLING_SHEET.specializedLabel,
    workbook.specializedSchooling,
    options,
  )

  const detailed = {
    nhq: buildDetailedPersonnelAnalyticsFromRecords(
      DETAILED_PERSONNEL_SHEET.tabs.nhq.label,
      workbook.detailed.nhq,
      options,
    ),
    nosus: buildDetailedPersonnelAnalyticsFromRecords(
      DETAILED_PERSONNEL_SHEET.tabs.nosus.label,
      workbook.detailed.nosus,
      options,
    ),
    rsu: buildDetailedPersonnelAnalyticsFromRecords(
      DETAILED_PERSONNEL_SHEET.tabs.rsu.label,
      workbook.detailed.rsu,
      options,
    ),
    rhqPpo: buildDetailedPersonnelAnalyticsFromRecords(
      DETAILED_PERSONNEL_SHEET.tabs.rhqPpo.label,
      workbook.detailed.rhqPpo,
      options,
    ),
  }

  const status = buildDetailedPersonnelStatusSummary(
    detailed.nhq,
    detailed.nosus,
    detailed.rsu,
    detailed.rhqPpo,
  )

  const detailedDashboard = {
    nhq: toDetailedPersonnelSummary(detailed.nhq),
    nosus: toDetailedPersonnelSummary(detailed.nosus),
    rsu: toDetailedPersonnelSummary(detailed.rsu),
    rhqPpo: toDetailedPersonnelSummary(detailed.rhqPpo),
    status: {
      terminatedCount: status.terminatedCount,
      expiringCount: status.expiringCount,
    },
  }

  return {
    lastUpdated: options.lastUpdated,
    fileName: options.fileName,
    personnel,
    personnelRecords: workbook.personnelRecords,
    mandatorySchooling,
    specializedSchooling,
    detailed,
    detailedDashboard,
  }
}

export function getRprmdDetailedTabLabel(tab: DetailedPersonnelTabKey) {
  return getDetailedTabLabel(tab)
}
