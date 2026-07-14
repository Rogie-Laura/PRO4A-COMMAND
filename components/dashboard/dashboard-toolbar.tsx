"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export type DashboardToolbarNav = {
  activeIndex: number
  total: number
  prevLabel: string | null
  nextLabel: string | null
  goToIndex: (index: number) => void
}

type ToolbarContextValue = {
  nav: DashboardToolbarNav | null
  setNav: (nav: DashboardToolbarNav | null) => void
}

const DashboardToolbarContext = createContext<ToolbarContextValue | null>(null)

/**
 * Holds an optional mobile pager bar published by the current page. Rendered by
 * DashboardLayoutClient outside the scrollable <main>, directly under the app header, so it can
 * never be scrolled past or have content pass behind it.
 */
export function DashboardToolbarProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<DashboardToolbarNav | null>(null)

  return (
    <DashboardToolbarContext.Provider value={{ nav, setNav }}>
      {children}
    </DashboardToolbarContext.Provider>
  )
}

/** Publish (and auto-clear on unmount) a prev/next pager into the app header area. */
export function useDashboardToolbarNav(nav: DashboardToolbarNav | null) {
  const ctx = useContext(DashboardToolbarContext)
  const setNav = ctx?.setNav
  const activeIndex = nav?.activeIndex
  const total = nav?.total
  const prevLabel = nav?.prevLabel
  const nextLabel = nav?.nextLabel
  const goToIndex = nav?.goToIndex

  useEffect(() => {
    if (!setNav) return
    setNav(
      goToIndex !== undefined && activeIndex !== undefined && total !== undefined
        ? { activeIndex, total, prevLabel: prevLabel ?? null, nextLabel: nextLabel ?? null, goToIndex }
        : null,
    )
    return () => setNav(null)
  }, [setNav, activeIndex, total, prevLabel, nextLabel, goToIndex])
}

export function DashboardToolbarOutlet() {
  const ctx = useContext(DashboardToolbarContext)
  const nav = ctx?.nav

  if (!nav) return null

  const canGoPrev = nav.activeIndex > 0
  const canGoNext = nav.activeIndex < nav.total - 1

  return (
    <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1 border-b border-border bg-background px-2 py-1.5 md:hidden">
      <Button
        type="button"
        variant="ghost"
        disabled={!canGoPrev}
        aria-label={nav.prevLabel ? `Previous: ${nav.prevLabel}` : "Previous section"}
        onClick={() => nav.goToIndex(nav.activeIndex - 1)}
        className="h-auto min-h-8 justify-start gap-0.5 px-1.5 py-1.5 text-left"
      >
        <ChevronLeftIcon className="size-4 shrink-0" />
        <span className="min-w-0 truncate text-[11px] font-medium leading-tight">
          {nav.prevLabel ?? ""}
        </span>
      </Button>

      <span className="px-1 text-xs font-semibold tabular-nums text-muted-foreground">
        {nav.activeIndex + 1}/{nav.total}
      </span>

      <Button
        type="button"
        variant="ghost"
        disabled={!canGoNext}
        aria-label={nav.nextLabel ? `Next: ${nav.nextLabel}` : "Next section"}
        onClick={() => nav.goToIndex(nav.activeIndex + 1)}
        className="h-auto min-h-8 justify-end gap-0.5 px-1.5 py-1.5 text-right"
      >
        <span className="min-w-0 truncate text-[11px] font-medium leading-tight">
          {nav.nextLabel ?? ""}
        </span>
        <ChevronRightIcon className="size-4 shrink-0" />
      </Button>
    </div>
  )
}
