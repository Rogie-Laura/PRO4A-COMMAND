"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BellRing } from "lucide-react"

import { updateAlertLevelAction } from "@/app/(dashboard)/settings/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ALERT_LEVEL_OPTIONS } from "@/lib/alert-level-config"
import type { AlertLevelId } from "@/lib/alert-level-types"
import { formatServerActionError } from "@/lib/server-action-errors"

type AlertLevelSettingsCardProps = {
  initialLevel: AlertLevelId
}

export function AlertLevelSettingsCard({ initialLevel }: AlertLevelSettingsCardProps) {
  const router = useRouter()
  const [level, setLevel] = useState<AlertLevelId>(initialLevel)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      try {
        await updateAlertLevelAction(level)
        setSuccess("Na-update ang Alert Level.")
        router.refresh()
      } catch (saveError) {
        setError(formatServerActionError(saveError, "Hindi ma-update ang Alert Level."))
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="size-5 text-primary" />
          Alert Level
        </CardTitle>
        <CardDescription>
          Piliin ang regional alert level para sa PRO4A Status. Access: System Administrator at R3
          — ROD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Alert level</span>
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value as AlertLevelId)}
            disabled={isPending}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {ALERT_LEVEL_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="block text-xs text-muted-foreground">
            Normal = blue · Heightened Alert = green · Full Alert = red
          </span>
        </label>

        <Button onClick={handleSave} disabled={isPending || level === initialLevel}>
          {isPending ? "Sine-save..." : "Save Alert Level"}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p> : null}
      </CardContent>
    </Card>
  )
}
