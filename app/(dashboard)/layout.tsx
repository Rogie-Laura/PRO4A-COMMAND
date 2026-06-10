import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth/get-session"

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  return <DashboardShell role={session?.role ?? "officer"}>{children}</DashboardShell>
}
