import { cn } from "@/lib/utils"

export const ridTableWrapperClass =
  "overflow-x-auto overflow-y-auto rounded-lg border bg-background/70"

export const ridTableClass = "w-full min-w-[640px] text-xs sm:min-w-[820px] sm:text-sm"

export const ridDialogTableClass = "w-full min-w-[360px] text-xs sm:min-w-[480px] sm:text-sm"

export function ridStickyLabelHeaderClass(extra?: string) {
  return cn(
    "sticky left-0 z-20 bg-muted/30 px-2 py-2 text-left text-[11px] font-medium sm:px-3 sm:py-3 sm:text-sm",
    "border-r border-border/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]",
    extra,
  )
}

export function ridStickyLabelCellClass(extra?: string) {
  return cn(
    "sticky left-0 z-10 bg-background px-2 py-2 text-[11px] font-medium sm:px-3 sm:py-3 sm:text-sm",
    "border-r border-border/60 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]",
    extra,
  )
}

export function ridStickyLabelTotalCellClass(extra?: string) {
  return cn(
    ridStickyLabelCellClass("bg-muted/20 font-semibold"),
    extra,
  )
}

export function ridDataHeaderClass(extra?: string) {
  return cn("px-1.5 py-1.5 text-center text-[10px] font-medium sm:px-2 sm:py-2 sm:text-xs", extra)
}

export function ridDataCellClass(extra?: string | false) {
  return cn("px-1.5 py-2 text-center tabular-nums sm:px-2 sm:py-3", extra || undefined)
}
