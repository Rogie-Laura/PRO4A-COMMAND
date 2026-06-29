"use client"

import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import { FirearmsSection } from "@/components/dashboard/firearms-section"
import { TotalVehiclesSection } from "@/components/dashboard/total-vehicles-section"
import { SectionPlaceholder } from "@/components/section-placeholder"
import type { FirearmsAnalytics } from "@/lib/firearms-types"
import type { MobilityAnalytics } from "@/lib/mobility-types"

type RlrddModulesCarouselProps = {
  firearms: FirearmsAnalytics
  mobility: MobilityAnalytics
}

export function RlrddModulesCarousel({ firearms, mobility }: RlrddModulesCarouselProps) {
  const slides = [
    {
      id: "firearms",
      label: "Firearms",
      dotClassName: "bg-rose-500",
      content: <FirearmsSection data={firearms} />,
    },
    {
      id: "vehicles",
      label: "Vehicles",
      dotClassName: "bg-sky-500",
      content: (
        <TotalVehiclesSection
          total={mobility.totalVehicles}
          offices={mobility.officeBreakdown}
          ownership={mobility.ownershipDistribution}
          condition={mobility.conditionDistribution}
          fleet={mobility.fleet}
          dataReady={mobility.dataReady}
        />
      ),
    },
    {
      id: "camps-offices",
      label: "Camps and Offices",
      dotClassName: "bg-amber-500",
      content: <SectionPlaceholder title="Camps and Offices" />,
    },
  ]

  return (
    <SwipeCarousel
      slides={slides}
      swipeHint="Swipe: Firearms · Vehicles · Camps and Offices"
      ariaLabel="RLRDD modules"
    />
  )
}
