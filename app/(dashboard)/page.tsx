import { redirect } from "next/navigation"

import { APP_DEFAULT_HREF } from "@/lib/auth/session-access"

export default function DashboardPage() {
  redirect(APP_DEFAULT_HREF)
}
