import type { DetailedPersonnelDashboardData } from "@/lib/detailed-personnel-analytics"
import type {
  DetailedPersonnelAnalytics,
  DetailedPersonnelRecord,
  DetailedPersonnelTabKey,
} from "@/lib/detailed-personnel-types"
import type { PersonnelAnalytics, PersonnelRecord } from "@/lib/personnel-types"
import type { SchoolingAnalytics, SchoolingRecord } from "@/lib/schooling-types"

export type ParsedRprmdWorkbook = {
  alphalistSheetName: string
  personnelRecords: PersonnelRecord[]
  mandatorySchooling: SchoolingRecord[]
  specializedSchooling: SchoolingRecord[]
  detailed: Record<DetailedPersonnelTabKey, DetailedPersonnelRecord[]>
}

export type RprmdWorkbookPayload = {
  lastUpdated: string
  fileName: string
  personnel: PersonnelAnalytics
  personnelRecords: PersonnelRecord[]
  mandatorySchooling: SchoolingAnalytics
  specializedSchooling: SchoolingAnalytics
  detailed: Record<DetailedPersonnelTabKey, DetailedPersonnelAnalytics>
  detailedDashboard: DetailedPersonnelDashboardData
}

export type RprmdWorkbookUploadBatchInfo = {
  id: string
  filename: string
  uploadedByLabel: string | null
  createdAt: string
}
