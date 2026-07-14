import { HardDrive, ShieldCheck } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { IctCybereasonBreakdown, IctStorageBreakdown } from "@/lib/ict-equipment-types"

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">{value.toLocaleString()}</p>
    </div>
  )
}

type IctServiceableExtrasProps = {
  cybereason?: IctCybereasonBreakdown
  storage?: IctStorageBreakdown
}

export function IctServiceableExtras({ cybereason, storage }: IctServiceableExtrasProps) {
  if (!cybereason && !storage) return null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cybereason ? (
        <Card className="gap-0 overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-card to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <ShieldCheck className="size-5" aria-hidden />
              <CardDescription className="font-medium text-sky-700/90 dark:text-sky-300/90">
                Cyber Reason
              </CardDescription>
            </div>
            <CardTitle className="text-3xl font-bold tabular-nums text-sky-700 dark:text-sky-300">
              {cybereason.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              <StatTile label="Installed Cybereason" value={cybereason.installed} />
              <StatTile label="Without Cybereason" value={cybereason.without} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {storage ? (
        <Card className="gap-0 overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
              <HardDrive className="size-5" aria-hidden />
              <CardDescription className="font-medium text-violet-700/90 dark:text-violet-300/90">
                HDD & SSD
              </CardDescription>
            </div>
            <CardTitle className="text-3xl font-bold tabular-nums text-violet-700 dark:text-violet-300">
              {storage.total.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              <StatTile label="HDD or HDD/SSD" value={storage.hddOrHybrid} />
              <StatTile label="SSD only" value={storage.ssdOnly} />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
