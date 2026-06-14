"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, LogOutIcon } from "lucide-react"

import { logoutAction } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function LogoutButton() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        type="button"
        onClick={() => setOpen(true)}
      >
        <LogOutIcon />
        Logout
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="flex gap-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-700 dark:text-amber-300">
                  Warning
                </p>
                <p className="text-muted-foreground">
                  You may lose your access token if you continue logging out.
                </p>
                <p className="text-muted-foreground">
                  Please contact the System Administrator for a new access token.
                </p>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Logging out..." : "Yes, log out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
