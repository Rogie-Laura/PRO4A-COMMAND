import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getSession } from "@/lib/auth/get-session"

type DashboardLayoutProps = {
  children: React.ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession()

  return (
    <DashboardLayoutClient role={session?.role ?? "officer"}>{children}</DashboardLayoutClient>
  )
}
