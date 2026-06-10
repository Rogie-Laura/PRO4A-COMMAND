import { Suspense } from "react"

import { LoginScreen } from "@/components/auth/login-screen"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
          Loading login...
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  )
}
