import { RidSectionsCarousel } from "@/components/dashboard/rid-sections-carousel"
import { getCriminalGangsAnalytics } from "@/lib/criminal-gangs-records"
import { getForeignNationalAnalytics } from "@/lib/foreign-national-records"
import { getIllegalDrugsAnalytics } from "@/lib/illegal-drugs-records"
import { getIntelEligibilityAnalytics } from "@/lib/intel-eligibility-records"
import { getRandomDrugTestAnalytics } from "@/lib/random-drug-test-records"
import { getSurrenderedCtgfAnalytics } from "@/lib/surrendered-ctgf-records"

export async function RidPageContent() {
  const [
    intelEligibilityAnalytics,
    illegalDrugsAnalytics,
    criminalGangsAnalytics,
    surrenderedCtgfAnalytics,
    foreignNationalAnalytics,
    randomDrugTestAnalytics,
  ] = await Promise.all([
    getIntelEligibilityAnalytics(),
    getIllegalDrugsAnalytics(),
    getCriminalGangsAnalytics(),
    getSurrenderedCtgfAnalytics(),
    getForeignNationalAnalytics(),
    getRandomDrugTestAnalytics(),
  ])

  return (
    <RidSectionsCarousel
      illegalDrugs={illegalDrugsAnalytics}
      criminalGangs={criminalGangsAnalytics}
      surrenderedCtgf={surrenderedCtgfAnalytics}
      foreignNational={foreignNationalAnalytics}
      intelEligibility={intelEligibilityAnalytics}
      randomDrugTest={randomDrugTestAnalytics}
    />
  )
}
