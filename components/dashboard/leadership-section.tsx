import { LeadershipCard } from "@/components/dashboard/leadership-card"
import type { LeadershipGroups } from "@/lib/personnel-types"

type LeadershipSectionProps = {
  leadership: LeadershipGroups
}

export function LeadershipSection({ leadership }: LeadershipSectionProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <LeadershipCard
        title="Regional Command Group"
        description="Regional command leadership"
        rows={leadership.regionalCommandGroup}
      />
      <LeadershipCard
        title="R-STAFF"
        description="Regional staff chiefs"
        rows={leadership.rStaff}
      />
      <LeadershipCard
        title="Provincial Directors and Force Commander"
        description="PPO leadership and RMFB4A commander"
        rows={leadership.provincialDirectors}
      />
    </div>
  )
}
