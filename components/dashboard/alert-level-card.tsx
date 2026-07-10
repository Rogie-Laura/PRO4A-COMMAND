import { BellRing } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  alertLevelBadgeClass,
  alertLevelCardClass,
  alertLevelTextClass,
  getAlertLevelLabel,
} from "@/lib/alert-level-config"
import type { AlertLevelSetting } from "@/lib/alert-level-types"
import { cn } from "@/lib/utils"

type AlertLevelCardProps = {
  setting: AlertLevelSetting
  compact?: boolean
}

export function AlertLevelCard({ setting, compact = false }: AlertLevelCardProps) {
  const label = getAlertLevelLabel(setting.level)

  return (
    <Card className={cn("h-full", alertLevelCardClass(setting.level), compact && "w-full")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className={cn("flex items-center gap-2", compact ? "text-base" : undefined)}>
              <BellRing className={cn("size-5", alertLevelTextClass(setting.level))} />
              Alert Level
            </CardTitle>
            <CardDescription>PRO4A CALABARZON regional posture</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge
          variant="outline"
          className={cn("text-base font-semibold", alertLevelBadgeClass(setting.level))}
        >
          {label}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {setting.updatedByLabel
            ? `Updated by ${setting.updatedByLabel}`
            : "Default regional alert level"}
          {setting.updatedAt ? ` · ${new Date(setting.updatedAt).toLocaleString("en-PH")}` : ""}
        </p>
      </CardContent>
    </Card>
  )
}
