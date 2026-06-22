import type { TrainingStatus } from "@/lib/trainings-config"
import type { CountItem } from "@/lib/personnel-types"

export type TrainingRecord = {
  id: string
  activity: string
  month: string
  classCount: number
  dateOpening: string
  dateClosing: string
  proposedSchedule: string
  status: TrainingStatus
  durationDays: string
  mode: string
  opr: string
  facilitator: string
  venue: string
  totalParticipants: number
}

export type TrainingsAnalytics = {
  lastUpdated: string
  dataReady: boolean
  dataSource: string
  programYear: string
  total: number
  uniquePrograms: number
  totalParticipants: number
  completionRate: number
  statusStats: CountItem[]
  modeStats: CountItem[]
  monthStats: CountItem[]
  records: TrainingRecord[]
}
