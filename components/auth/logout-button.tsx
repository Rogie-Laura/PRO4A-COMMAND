"use client"

import { LogOutIcon } from "lucide-react"

import { logoutAction } from "@/app/login/actions"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="outline" size="sm" className="w-full" type="submit">
        <LogOutIcon />
        Logout
      </Button>
    </form>
  )
}
