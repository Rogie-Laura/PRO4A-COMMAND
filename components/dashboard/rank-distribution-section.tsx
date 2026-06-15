import { RankPieCard } from "@/components/dashboard/rank-pie-card"
import { SwipeCarousel } from "@/components/dashboard/swipe-carousel"
import type { RankDistribution } from "@/lib/personnel-types"

type RankDistributionSectionProps = {
  distribution: RankDistribution
}

export function RankDistributionSection({ distribution }: RankDistributionSectionProps) {
  const slides = [
    {
      id: "pco",
      label: "Distribution of Personnel by Rank (PCO)",
      dotClassName: "bg-blue-500",
      content: (
        <RankPieCard
          title="Distribution of Personnel by Rank (PCO)"
          description="Commissioned officers by rank"
          data={distribution.pco}
          variant="pco"
        />
      ),
    },
    {
      id: "pnco",
      label: "Distribution of Personnel by Rank (PNCO)",
      dotClassName: "bg-violet-500",
      content: (
        <RankPieCard
          title="Distribution of Personnel by Rank (PNCO)"
          description="Non-commissioned officers by rank"
          data={distribution.pnco}
          variant="pnco"
        />
      ),
    },
  ]

  return (
    <>
      <SwipeCarousel
        className="lg:hidden"
        slides={slides}
        swipeHint="Swipe left for PCO · PNCO rank distribution"
        ariaLabel="Personnel rank distribution cards"
      />

      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <RankPieCard
          title="Distribution of Personnel by Rank (PCO)"
          description="Commissioned officers by rank"
          data={distribution.pco}
          variant="pco"
        />
        <RankPieCard
          title="Distribution of Personnel by Rank (PNCO)"
          description="Non-commissioned officers by rank"
          data={distribution.pnco}
          variant="pnco"
        />
      </div>
    </>
  )
}
