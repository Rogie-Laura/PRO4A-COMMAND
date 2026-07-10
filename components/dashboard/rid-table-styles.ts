import { cn } from "@/lib/utils"

export const ridTableWrapperClass =
  "isolate overflow-x-auto overflow-y-auto rounded-lg border bg-background"

export const ridTableClass = "w-full min-w-[640px] text-xs sm:min-w-[820px] sm:text-sm"

export const ridDialogTableClass = "w-full min-w-[360px] text-xs sm:min-w-[480px] sm:text-sm"

const ridStickyLabelBaseClass =
  "sticky left-0 min-w-[5.5rem] border-r border-border shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)] sm:min-w-[6.75rem]"

export function ridStickyLabelHeaderClass(extra?: string) {
  return cn(
    ridStickyLabelBaseClass,
    "z-30 bg-muted px-2 py-2 text-left text-[11px] font-medium sm:px-3 sm:py-3 sm:text-sm",
    extra,
  )
}

export function ridStickyLabelCellClass(extra?: string) {
  return cn(
    ridStickyLabelBaseClass,
    "z-20 bg-background px-2 py-2 text-[11px] font-medium sm:px-3 sm:py-3 sm:text-sm",
    extra,
  )
}

export function ridStickyLabelTotalCellClass(extra?: string) {
  return cn(
    ridStickyLabelBaseClass,
    "z-20 bg-muted px-2 py-2 text-[11px] font-semibold sm:px-3 sm:py-3 sm:text-sm",
    extra,
  )
}

export function ridDataHeaderClass(extra?: string) {
  return cn(
    "bg-muted/30 px-1.5 py-1.5 text-center text-[10px] font-medium sm:px-2 sm:py-2 sm:text-xs",
    extra,
  )
}

export function ridDataCellClass(extra?: string | false) {
  return cn("bg-background px-1.5 py-2 text-center tabular-nums sm:px-2 sm:py-3", extra || undefined)
}
