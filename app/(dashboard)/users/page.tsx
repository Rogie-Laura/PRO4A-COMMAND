import { Suspense } from "react"

import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { PersonnelUsersContent } from "@/components/dashboard/personnel-users-content"

export default function UsersPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <PersonnelUsersContent />
    </Suspense>
  )
}
