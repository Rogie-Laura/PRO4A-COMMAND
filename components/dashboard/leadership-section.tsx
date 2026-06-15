import { LeadershipCard } from "@/components/dashboard/leadership-card"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import type { LeadershipGroups } from "@/lib/personnel-types"

type LeadershipSectionProps = {
  leadership: LeadershipGroups
}

export function LeadershipSection({ leadership }: LeadershipSectionProps) {
  const slides = [
    {
      id: "rcg",
      label: "Regional Command Group",
      dotClassName: "bg-primary",
      content: (
        <LeadershipCard
          title="Regional Command Group"
          description="Regional command leadership"
          rows={leadership.regionalCommandGroup}
        />
      ),
    },
    {
      id: "r-staff",
      label: "R-STAFF",
      dotClassName: "bg-sky-500",
      content: (
        <LeadershipCard
          title="R-STAFF"
          description="Regional staff chiefs"
          rows={leadership.rStaff}
        />
      ),
    },
    {
      id: "provincial-directors",
      label: "Provincial Directors and Force Commander",
      dotClassName: "bg-amber-500",
      content: (
        <LeadershipCard
          title="Provincial Directors and Force Commander"
          description="PPO leadership and RMFB4A commander"
          rows={leadership.provincialDirectors}
        />
      ),
    },
  ]

  return (
    <>
      <SwipeCarousel
        className="xl:hidden"
        slides={slides}
        swipeHint="Swipe left for Regional Command Group · R-STAFF · Provincial Directors"
        ariaLabel="Key leadership cards"
      />

      <div className="hidden gap-4 xl:grid xl:grid-cols-3">
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
    </>
  )
}
