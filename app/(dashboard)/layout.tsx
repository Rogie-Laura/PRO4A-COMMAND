import { DashboardShell } from "@/components/dashboard-shell"
import { getSession } from "@/lib/auth/get-session"
import { redirect } from "next/navigation"

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <DashboardShell session={session}>{children}</DashboardShell>
}
