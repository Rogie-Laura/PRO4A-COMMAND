import { DashboardLayoutClient } from "@/components/dashboard-layout-client"
import { getSession } from "@/lib/auth/get-session"

type DashboardLayoutProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export async function DashboardLayout({
  title,
  description,
  children,
}: DashboardLayoutProps) {
  const session = await getSession()

  return (
    <DashboardLayoutClient
      title={title}
      description={description}
      role={session?.role ?? "officer"}
    >
      {children}
    </DashboardLayoutClient>
  )
}
