import { ArrowRightLeft, Building2, Network, Radio } from "lucide-react"

import { DetailedPersonnelSection } from "@/components/dashboard/detailed-personnel-section"
import { DetailedPersonnelStatusSection } from "@/components/dashboard/detailed-personnel-status-section"
import { DetailedPersonnelSummarySection } from "@/components/dashboard/detailed-personnel-summary-section"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import type { DetailedPersonnelStatusCounts } from "@/lib/detailed-personnel-status"
import type { DetailedPersonnelSummary } from "@/lib/detailed-personnel-types"

type DetailedPersonnelSectionsProps = {
  nhq: DetailedPersonnelSummary
  nosus: DetailedPersonnelSummary
  rsu: DetailedPersonnelSummary
  rhqPpo: DetailedPersonnelSummary
  status: DetailedPersonnelStatusCounts
}

const SLIDE_CONFIG = [
  {
    id: "detailed-nhq",
    label: "Detailed NHQ",
    dotClassName: "bg-sky-500",
    icon: Building2,
    tab: "nhq" as const,
    accentClassName:
      "gap-0 overflow-hidden border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-sky-500/5 to-card text-sky-700 dark:text-sky-300 [&_[data-slot=card-description]]:text-sky-700/90 dark:[&_[data-slot=card-description]]:text-sky-300/90",
    dataKey: "nhq" as const,
  },
  {
    id: "detailed-nosus",
    label: "Detailed NOSUs",
    dotClassName: "bg-violet-500",
    icon: Network,
    tab: "nosus" as const,
    accentClassName:
      "gap-0 overflow-hidden border-violet-500/25 bg-gradient-to-br from-violet-500/15 via-violet-500/5 to-card text-violet-700 dark:text-violet-300 [&_[data-slot=card-description]]:text-violet-700/90 dark:[&_[data-slot=card-description]]:text-violet-300/90",
    dataKey: "nosus" as const,
  },
  {
    id: "detailed-rsu",
    label: "Detailed RSU",
    dotClassName: "bg-amber-500",
    icon: Radio,
    tab: "rsu" as const,
    accentClassName:
      "gap-0 overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-card text-amber-700 dark:text-amber-300 [&_[data-slot=card-description]]:text-amber-700/90 dark:[&_[data-slot=card-description]]:text-amber-300/90",
    dataKey: "rsu" as const,
  },
  {
    id: "detailed-rhq-ppo",
    label: "Detailed RHQ & PPO",
    dotClassName: "bg-emerald-500",
    icon: ArrowRightLeft,
    tab: "rhqPpo" as const,
    accentClassName:
      "gap-0 overflow-hidden border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-card text-emerald-700 dark:text-emerald-300 [&_[data-slot=card-description]]:text-emerald-700/90 dark:[&_[data-slot=card-description]]:text-emerald-300/90",
    dataKey: "rhqPpo" as const,
  },
] as const

export function DetailedPersonnelSections({
  nhq,
  nosus,
  rsu,
  rhqPpo,
  status,
}: DetailedPersonnelSectionsProps) {
  const dataByKey = { nhq, nosus, rsu, rhqPpo }

  return (
    <div className="space-y-4">
      <DetailedPersonnelSummarySection nhq={nhq} nosus={nosus} rsu={rsu} rhqPpo={rhqPpo} />

      <SwipeCarousel
        className="lg:hidden"
        swipeHint="Swipe for Detailed NHQ · NOSUs · RSU · RHQ & PPO"
        ariaLabel="Detailed personnel sections"
        slides={SLIDE_CONFIG.map((slide) => ({
          id: slide.id,
          label: slide.label,
          dotClassName: slide.dotClassName,
          content: (
            <DetailedPersonnelSection
              tab={slide.tab}
              summary={dataByKey[slide.dataKey]}
              icon={slide.icon}
              accentClassName={slide.accentClassName}
            />
          ),
        }))}
      />

      <div className="hidden grid-cols-2 gap-4 xl:grid-cols-4 lg:grid">
        {SLIDE_CONFIG.map((slide) => (
          <DetailedPersonnelSection
            key={slide.id}
            tab={slide.tab}
            summary={dataByKey[slide.dataKey]}
            icon={slide.icon}
            accentClassName={slide.accentClassName}
          />
        ))}
      </div>

      <DetailedPersonnelStatusSection status={status} />
    </div>
  )
}
