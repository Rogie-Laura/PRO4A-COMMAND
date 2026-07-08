import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getSession } from "@/lib/auth/get-session"

type DashboardLayoutProps = {
  children: React.ReactNode
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession()

  const layoutSession = session ?? {
    apiKeyId: "",
    label: "Guest",
    role: "officer" as const,
    divisionScope: null,
  }

  return (
    <DashboardLayoutClient title="PRO4A COMMAND" session={layoutSession}>
      {children}
    </DashboardLayoutClient>
  )
}
