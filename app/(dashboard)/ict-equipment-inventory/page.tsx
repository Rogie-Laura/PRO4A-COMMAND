import { Suspense } from "react"

import {
  IctEquipmentContent,
  IctEquipmentLoading,
} from "@/components/dashboard/ict-equipment-content"

export default function IctEquipmentInventoryPage() {
  return (
    <Suspense fallback={<IctEquipmentLoading />}>
      <IctEquipmentContent />
    </Suspense>
  )
}
