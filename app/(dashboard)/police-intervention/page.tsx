import {
  getPatrollersMonitorUrl,
} from "@/lib/patrol-intervention-config"
import { PoliceInterventionContent } from "@/components/dashboard/police-intervention-content"

export default function PoliceInterventionPage() {
  return <PoliceInterventionContent patrollersUrl={getPatrollersMonitorUrl()} />
}
