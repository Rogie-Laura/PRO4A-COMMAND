"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDrugClearingRegionalTotal } from "@/lib/drug-clearing-analytics"
import type {
  DrugClearingAnalytics,
  DrugClearingBarangayStatus,
  DrugClearingMunicipality,
  DrugClearingProvince,
} from "@/lib/drug-clearing-types"
import { cn } from "@/lib/utils"

type DrugClearingPanelProps = {
  analytics: DrugClearingAnalytics
}

const STATUS_LABELS: Record<DrugClearingBarangayStatus, string> = {
  cleared: "Drug Cleared",
  affected: "Drug Affected",
  unaffected: "Unaffected",
  drug_free: "Drug Free",
  unknown: "Unspecified",
}

const STATUS_BADGE_CLASS: Record<DrugClearingBarangayStatus, string> = {
  cleared: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  affected: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  unaffected: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  drug_free: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  unknown: "border-muted-foreground/20 bg-muted/40 text-muted-foreground",
}

function formatCount(value: number) {
  return value.toLocaleString("en-PH")
}

function KpiChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-violet-500/20 bg-background/70 px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-violet-700 dark:text-violet-300">
        {formatCount(value)}
      </p>
    </div>
  )
}

function BarangayDetails({ municipality }: { municipality: DrugClearingMunicipality }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiChip label="Total Barangays" value={municipality.totalBarangays} />
        <KpiChip label="Cleared" value={municipality.cleared} />
        <KpiChip label="Affected" value={municipality.affected} />
        <KpiChip label="Unaffected" value={municipality.unaffected} />
        <KpiChip label="Drug Free" value={municipality.drugFree} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {municipality.barangays.map((barangay) => (
          <div
            key={`${municipality.name}-${barangay.name}`}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5 text-sm"
          >
            <span className="min-w-0 leading-snug">{barangay.name}</span>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-[11px]", STATUS_BADGE_CLASS[barangay.status])}
            >
              {STATUS_LABELS[barangay.status]}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function MunicipalityList({
  province,
  onSelect,
}: {
  province: DrugClearingProvince
  onSelect: (municipalityName: string) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {formatCount(province.municipalities.length)} municipalities · piliin ang bayan para sa
        barangay details
      </p>
      <div className="divide-y rounded-lg border bg-background/70">
        {province.municipalities.map((municipality) => (
          <button
            key={`${province.name}-${municipality.name}`}
            type="button"
            onClick={() => onSelect(municipality.name)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <div className="min-w-0">
              <p className="font-medium leading-snug">{municipality.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCount(municipality.totalBarangays)} barangays ·{" "}
                {formatCount(municipality.cleared)} cleared ·{" "}
                {formatCount(municipality.affected)} affected ·{" "}
                {formatCount(municipality.drugFree)} drug free
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function DrugClearingPanel({ analytics }: DrugClearingPanelProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)

  const regionalTotal = useMemo(() => getDrugClearingRegionalTotal(analytics.recap), [analytics.recap])
  const provinceRows = useMemo(
    () => analytics.recap.filter((row) => !row.isTotal),
    [analytics.recap],
  )

  const activeProvince = useMemo(
    () => analytics.provinces.find((province) => province.name === selectedProvince) ?? null,
    [analytics.provinces, selectedProvince],
  )

  const activeMunicipality = useMemo(() => {
    if (!activeProvince || !selectedMunicipality) return null
    return (
      activeProvince.municipalities.find(
        (municipality) => municipality.name === selectedMunicipality,
      ) ?? null
    )
  }, [activeProvince, selectedMunicipality])

  function handleProvinceSelect(provinceName: string) {
    setSelectedProvince(provinceName)
    setSelectedMunicipality(null)
  }

  function handleMunicipalitySelect(municipalityName: string) {
    setSelectedMunicipality(municipalityName)
  }

  function handleBackToRecap() {
    setSelectedProvince(null)
    setSelectedMunicipality(null)
  }

  function handleBackToProvince() {
    setSelectedMunicipality(null)
  }

  if (!analytics.dataReady) {
    return (
      <Card className="border-dashed border-muted-foreground/25 bg-muted/10">
        <CardHeader>
          <CardTitle>Drug Clearing / Drug Cleared Barangays</CardTitle>
          <CardDescription>
            Walang drug clearing data pa. Mag-upload ng drug_clearing.xlsx sa RCADD Upload File.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-violet-600 dark:text-violet-400" />
          Drug Clearing / Drug Cleared Barangays
        </CardTitle>
        <CardDescription>
          Regional recap validated by ROCBDC · i-click ang province, tapos ang bayan para sa
          barangay details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedProvince ? (
          <>
            {regionalTotal ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <KpiChip label="Cities / Municipalities" value={regionalTotal.citiesMunicipalities} />
                <KpiChip label="Total Barangays" value={regionalTotal.totalBarangays} />
                <KpiChip label="Cleared Barangays (ROCBDC)" value={regionalTotal.clearedBarangays} />
                <KpiChip label="Remaining Affected" value={regionalTotal.remainingAffected} />
                <KpiChip label="Unaffected Barangays" value={regionalTotal.unaffected} />
                <KpiChip label="Drug Free Barangays" value={regionalTotal.drugFree} />
              </div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border bg-background/70">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Province</th>
                    <th className="px-4 py-3 font-medium text-right">Cities/Mun.</th>
                    <th className="px-4 py-3 font-medium text-right">Total Brgy</th>
                    <th className="px-4 py-3 font-medium text-right">Cleared</th>
                    <th className="px-4 py-3 font-medium text-right">Affected</th>
                    <th className="px-4 py-3 font-medium text-right">Unaffected</th>
                    <th className="px-4 py-3 font-medium text-right">Drug Free</th>
                  </tr>
                </thead>
                <tbody>
                  {provinceRows.map((row) => (
                    <tr
                      key={row.province}
                      className="cursor-pointer border-b transition-colors last:border-0 hover:bg-violet-500/5"
                      onClick={() => handleProvinceSelect(row.province)}
                    >
                      <td className="px-4 py-3 font-medium text-violet-700 dark:text-violet-300">
                        <span className="inline-flex items-center gap-1">
                          {row.province}
                          <ChevronRight className="size-3.5 opacity-60" />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(row.citiesMunicipalities)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(row.totalBarangays)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-violet-700 dark:text-violet-300">
                        {formatCount(row.clearedBarangays)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-700 dark:text-amber-300">
                        {formatCount(row.remainingAffected)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(row.unaffected)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-700 dark:text-emerald-300">
                        {formatCount(row.drugFree)}
                      </td>
                    </tr>
                  ))}
                  {regionalTotal ? (
                    <tr className="bg-muted/20 font-semibold">
                      <td className="px-4 py-3">TOTAL</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(regionalTotal.citiesMunicipalities)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(regionalTotal.totalBarangays)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(regionalTotal.clearedBarangays)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(regionalTotal.remainingAffected)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(regionalTotal.unaffected)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCount(regionalTotal.drugFree)}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {selectedProvince && activeProvince ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectedMunicipality ? handleBackToProvince : handleBackToRecap}
                className="h-8 px-2"
              >
                <ArrowLeft className="size-4" />
                {selectedMunicipality ? `Back to ${selectedProvince}` : "Back to recap"}
              </Button>
              <p className="text-sm text-muted-foreground">
                {selectedMunicipality ? (
                  <>
                    <span className="font-medium text-foreground">{selectedProvince}</span>
                    {" · "}
                    <span className="font-medium text-foreground">{selectedMunicipality}</span>
                  </>
                ) : (
                  <span className="font-medium text-foreground">{selectedProvince}</span>
                )}
              </p>
            </div>

            {activeMunicipality ? (
              <BarangayDetails municipality={activeMunicipality} />
            ) : (
              <MunicipalityList province={activeProvince} onSelect={handleMunicipalitySelect} />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
