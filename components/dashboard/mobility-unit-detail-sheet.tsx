"use client"

import { OfficeLogo } from "@/components/dashboard/office-logo"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  UnitStationBreakdown,
  UnitVehicleTypeBreakdown,
  VehicleUnitBreakdownItem,
} from "@/lib/mobility-types"

type MobilityUnitDetailSheetProps = {
  unit: VehicleUnitBreakdownItem | null
  vehicleTypes: UnitVehicleTypeBreakdown | null
  stations: UnitStationBreakdown | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_ITEMS = [
  { key: "svc", label: "Serviceable", shortLabel: "SVC", colorClass: "bg-emerald-500" },
  { key: "unsvc", label: "Unserviceable", shortLabel: "UNSVC", colorClass: "bg-amber-500" },
  { key: "ber", label: "Beyond Economic Repair", shortLabel: "BER", colorClass: "bg-rose-500" },
] as const

export function MobilityUnitDetailSheet({
  unit,
  vehicleTypes,
  stations,
  open,
  onOpenChange,
}: MobilityUnitDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {unit ? (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center gap-3 pr-8">
                <OfficeLogo
                  src={unit.logo}
                  alt={unit.label}
                  fallback={unit.shortLabel}
                  colorClass={unit.colorClass}
                />
                <div className="min-w-0">
                  <SheetTitle>{unit.label}</SheetTitle>
                  <SheetDescription>
                    {unit.total.toLocaleString()} vehicles · CLEARBOOK detail
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 py-4">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Status Breakdown</h3>
                {STATUS_ITEMS.map((item) => {
                  const count = unit.status[item.key]
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`size-2.5 rounded-full ${item.colorClass}`} />
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.shortLabel}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold tabular-nums text-primary">
                        {count.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </section>

              {vehicleTypes && vehicleTypes.vehicleTypes.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">By Vehicle Type</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">SVC</th>
                          <th className="px-3 py-2 font-medium">UNSVC</th>
                          <th className="px-3 py-2 font-medium">BER</th>
                          <th className="px-3 py-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicleTypes.vehicleTypes.map((item) => (
                          <tr key={item.vehicleType} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">{item.vehicleType}</td>
                            <td className="px-3 py-2 tabular-nums">
                              {(
                                item.breakdown.serviceable.organic +
                                item.breakdown.serviceable.donated +
                                item.breakdown.serviceable.loaned
                              ).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {(
                                item.breakdown.unserviceable.organic +
                                item.breakdown.unserviceable.donated +
                                item.breakdown.unserviceable.loaned
                              ).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {(
                                item.breakdown.ber.organic +
                                item.breakdown.ber.donated +
                                item.breakdown.ber.loaned
                              ).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 tabular-nums text-primary">
                              {item.breakdown.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              {stations && stations.stations.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">Per Station</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                          <th className="px-3 py-2 font-medium">Station</th>
                          <th className="px-3 py-2 font-medium">SVC</th>
                          <th className="px-3 py-2 font-medium">UNSVC</th>
                          <th className="px-3 py-2 font-medium">BER</th>
                          <th className="px-3 py-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.stations.map((station) => (
                          <tr key={station.station} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">{station.station}</td>
                            <td className="px-3 py-2 tabular-nums">{station.status.svc.toLocaleString()}</td>
                            <td className="px-3 py-2 tabular-nums">{station.status.unsvc.toLocaleString()}</td>
                            <td className="px-3 py-2 tabular-nums">{station.status.ber.toLocaleString()}</td>
                            <td className="px-3 py-2 tabular-nums text-primary">
                              {station.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
