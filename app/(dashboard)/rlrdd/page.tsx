import { OfficeModuleHub } from "@/components/dashboard/office-module-hub"

export default function RlrddPage() {
  return (
    <OfficeModuleHub
      title="RLRDD"
      description="Regional Logistics, Research and Development Division modules."
      modules={[
        {
          title: "Mobility",
          href: "/mobility",
          description: "Regional fleet registry and vehicle distribution.",
        },
        {
          title: "Firearms",
          href: "/firearms",
          description: "Firearms inventory and distribution records.",
        },
        {
          title: "Camps and Offices",
          href: "/camps-offices",
          description: "Camps, offices, and facility registry.",
        },
      ]}
    />
  )
}
