import { RankPieCard } from "@/components/dashboard/rank-pie-card"
import type { RankDistribution } from "@/lib/personnel-types"

type RankDistributionSectionProps = {
  distribution: RankDistribution
}

export function RankDistributionSection({ distribution }: RankDistributionSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RankPieCard
        title="Distribution of Personnel by Rank (PCO)"
        description="Commissioned officers by rank"
        data={distribution.pco}
      />
      <RankPieCard
        title="Distribution of Personnel by Rank (PNCO)"
        description="Non-commissioned officers by rank"
        data={distribution.pnco}
      />
    </div>
  )
}
