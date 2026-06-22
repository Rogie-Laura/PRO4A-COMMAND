import { DetailedPersonnelSections } from "@/components/dashboard/detailed-personnel-sections"
import {
  getDetailedNhqAnalytics,
  getDetailedNosusAnalytics,
  getDetailedRhqPpoAnalytics,
  getDetailedRsuAnalytics,
  toDetailedPersonnelSummary,
} from "@/lib/detailed-personnel-analytics"
import { buildDetailedPersonnelStatusCounts } from "@/lib/detailed-personnel-status"

export async function DetailedPersonnelSectionsLoader() {
  const [nhq, nosus, rsu, rhqPpo] = await Promise.all([
    getDetailedNhqAnalytics(),
    getDetailedNosusAnalytics(),
    getDetailedRsuAnalytics(),
    getDetailedRhqPpoAnalytics(),
  ])

  return (
    <DetailedPersonnelSections
      nhq={toDetailedPersonnelSummary(nhq)}
      nosus={toDetailedPersonnelSummary(nosus)}
      rsu={toDetailedPersonnelSummary(rsu)}
      rhqPpo={toDetailedPersonnelSummary(rhqPpo)}
      status={buildDetailedPersonnelStatusCounts(nhq, nosus, rsu, rhqPpo)}
    />
  )
}
