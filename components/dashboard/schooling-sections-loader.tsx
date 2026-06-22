import { SchoolingSections } from "@/components/dashboard/schooling-sections"
import {
  getSchoolingMandatoryAnalytics,
  getSchoolingSpecializedAnalytics,
  toSchoolingSummary,
} from "@/lib/schooling-analytics"

export async function SchoolingSectionsLoader() {
  const [mandatory, specialized] = await Promise.all([
    getSchoolingMandatoryAnalytics(),
    getSchoolingSpecializedAnalytics(),
  ])

  return (
    <SchoolingSections
      mandatory={toSchoolingSummary(mandatory)}
      specialized={toSchoolingSummary(specialized)}
    />
  )
}
