import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getSession } from "@/lib/auth/get-session"

type DashboardLayoutProps = {
  children: React.ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession()

  return (
    <DashboardLayoutClient title="PRO4A COMMAND" role={session?.role ?? "officer"}>
      {children}
    </DashboardLayoutClient>
  )
}
