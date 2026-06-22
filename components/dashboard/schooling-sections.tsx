import { BookOpenCheck, GraduationCap } from "lucide-react"

import { SchoolingSection } from "@/components/dashboard/schooling-section"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import type { SchoolingAnalytics } from "@/lib/schooling-types"

type SchoolingSectionsProps = {
  mandatory: SchoolingAnalytics
  specialized: SchoolingAnalytics
}

export function SchoolingSections({ mandatory, specialized }: SchoolingSectionsProps) {
  return (
    <>
      <SwipeCarousel
        className="lg:hidden"
        swipeHint="Swipe for Schooling Mandatory · Schooling Specialized"
        ariaLabel="Schooling sections"
        slides={[
          {
            id: "schooling-mandatory",
            label: "Schooling Mandatory",
            dotClassName: "bg-indigo-500",
            content: (
              <SchoolingSection
                data={mandatory}
                icon={GraduationCap}
                accentClassName="gap-0 overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-card text-indigo-700 dark:text-indigo-300 [&_[data-slot=card-description]]:text-indigo-700/90 dark:[&_[data-slot=card-description]]:text-indigo-300/90"
              />
            ),
          },
          {
            id: "schooling-specialized",
            label: "Schooling Specialized",
            dotClassName: "bg-teal-500",
            content: (
              <SchoolingSection
                data={specialized}
                icon={BookOpenCheck}
                accentClassName="gap-0 overflow-hidden border-teal-500/25 bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-card text-teal-700 dark:text-teal-300 [&_[data-slot=card-description]]:text-teal-700/90 dark:[&_[data-slot=card-description]]:text-teal-300/90"
              />
            ),
          },
        ]}
      />

      <div className="hidden space-y-6 lg:block">
        <SchoolingSection
          data={mandatory}
          icon={GraduationCap}
          accentClassName="gap-0 overflow-hidden border-indigo-500/25 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-card text-indigo-700 dark:text-indigo-300 [&_[data-slot=card-description]]:text-indigo-700/90 dark:[&_[data-slot=card-description]]:text-indigo-300/90"
        />
        <SchoolingSection
          data={specialized}
          icon={BookOpenCheck}
          accentClassName="gap-0 overflow-hidden border-teal-500/25 bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-card text-teal-700 dark:text-teal-300 [&_[data-slot=card-description]]:text-teal-700/90 dark:[&_[data-slot=card-description]]:text-teal-300/90"
        />
      </div>
    </>
  )
}
