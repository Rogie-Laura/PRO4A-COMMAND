import type { Metadata } from "next"

import { DigitalLaunchScreen } from "@/components/launch/digital-launch-screen"

export const metadata: Metadata = {
  title: "Digital Launching — PRO4A COMMAND",
  description:
    "Official digital launching of PRO4A COMMAND — Centralized Operations Monitoring and MANagement Dashboard",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DigitalLaunchPage() {
  return <DigitalLaunchScreen />
}
