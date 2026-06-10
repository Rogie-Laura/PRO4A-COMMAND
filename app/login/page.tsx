import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginScreen } from "@/components/auth/login-screen"

export const metadata: Metadata = {
  title: "Login — PRO4A COMMAND",
  description: "Centralized Operations Monitoring and MANagement Dashboard",
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#05070f] text-sm text-slate-200">
          Loading login...
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  )
}
