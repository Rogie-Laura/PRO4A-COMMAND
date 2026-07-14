"use client"

import { CriminalGangsCards } from "@/components/dashboard/criminal-gangs-cards"
import { ForeignNationalTable } from "@/components/dashboard/foreign-national-table"
import { IllegalDrugsCards } from "@/components/dashboard/illegal-drugs-cards"
import { IntelEligibilityCards } from "@/components/dashboard/intel-eligibility-cards"
import { RidSectionHeader } from "@/components/dashboard/rid-section-header"
import { SurrenderedCtgfTable } from "@/components/dashboard/surrendered-ctgf-table"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import type { CriminalGangsAnalytics } from "@/lib/criminal-gangs-types"
import type { ForeignNationalAnalytics } from "@/lib/foreign-national-types"
import type { IllegalDrugsAnalytics } from "@/lib/illegal-drugs-types"
import type { IntelEligibilityAnalytics } from "@/lib/intel-eligibility-types"
import type { SurrenderedCtgfAnalytics } from "@/lib/surrendered-ctgf-types"

type RidSectionsCarouselProps = {
  illegalDrugs: IllegalDrugsAnalytics
  criminalGangs: CriminalGangsAnalytics
  surrenderedCtgf: SurrenderedCtgfAnalytics
  foreignNational: ForeignNationalAnalytics
  intelEligibility: IntelEligibilityAnalytics
}

export function RidSectionsCarousel({
  illegalDrugs,
  criminalGangs,
  surrenderedCtgf,
  foreignNational,
  intelEligibility,
}: RidSectionsCarouselProps) {
  const slides = [
    {
      id: "illegal-drugs",
      label: "Illegal Drugs",
      dotClassName: "bg-amber-500",
      content: (
        <section className="space-y-4">
          <RidSectionHeader
            title="Illegal Drugs"
            description="HVI at SLI accomplishments"
            uploadedAt={illegalDrugs.lastUpdated}
            dataReady={illegalDrugs.dataReady}
          />
          <IllegalDrugsCards analytics={illegalDrugs} />
        </section>
      ),
    },
    {
      id: "criminal-gangs",
      label: "Criminal Gangs",
      dotClassName: "bg-rose-500",
      content: (
        <section className="space-y-4">
          <RidSectionHeader
            title="Criminal Gangs"
            description="Drug Groups, Gun-for-Hire, at Other Criminal Groups"
            uploadedAt={criminalGangs.lastUpdated}
            dataReady={criminalGangs.dataReady}
          />
          <CriminalGangsCards analytics={criminalGangs} />
        </section>
      ),
    },
    {
      id: "surrendered-ctgf",
      label: "Surrendered CTGs",
      dotClassName: "bg-teal-500",
      content: (
        <section className="space-y-4">
          <SurrenderedCtgfTable analytics={surrenderedCtgf} />
        </section>
      ),
    },
    {
      id: "foreign-national",
      label: "Foreign National",
      dotClassName: "bg-indigo-500",
      content: (
        <section className="space-y-4">
          <ForeignNationalTable analytics={foreignNational} />
        </section>
      ),
    },
    {
      id: "intel-eligibility",
      label: "IEL",
      dotClassName: "bg-sky-500",
      content: (
        <section className="space-y-4">
          <RidSectionHeader
            title="Intelligence Eligibility List"
            description="Authorized vs actual strength, training, seminar, at related intel personnel metrics"
            uploadedAt={intelEligibility.lastUpdated}
            dataReady={intelEligibility.dataReady}
          />
          <IntelEligibilityCards analytics={intelEligibility} />
        </section>
      ),
    },
  ]

  return (
    <>
      <SwipeCarousel
        className="md:hidden"
        swipeHint="Swipe left/right · Illegal Drugs · Criminal Gangs · Surrendered · Foreign National · IEL"
        ariaLabel="RID sections"
        scrollToTopOnChange
        clipSlides
        slides={slides}
      />

      <div className="hidden space-y-6 md:block">
        {slides.map((slide) => (
          <div key={slide.id}>{slide.content}</div>
        ))}
      </div>
    </>
  )
}
