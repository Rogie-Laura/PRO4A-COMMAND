import { OfficeModuleHub } from "@/components/dashboard/office-module-hub"

export default function RidmdPage() {
  return (
    <OfficeModuleHub
      title="RIDMD"
      description="Regional Intelligence and Investigation Management Division modules."
      modules={[
        {
          title: "Crime Statistics",
          href: "/crime-statistics",
          description: "Regional crime volume and classification analytics.",
        },
        {
          title: "Comparative Crime Stats",
          href: "/comparative-crime-stats",
          description: "Year-over-year and period crime volume comparison.",
        },
      ]}
    />
  )
}
