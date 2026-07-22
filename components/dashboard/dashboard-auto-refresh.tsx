"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import { DASHBOARD_REFRESH_EVENT } from "@/lib/dashboard-refresh"
import { createBrowserSupabaseClient } from "@/lib/supabase/browser"

/**
 * Listens to Supabase Realtime on the shared dashboard revision stamp.
 * When any upload/refresh bumps the stamp, open dashboards re-render with
 * fresh server data — no polling and no manual refresh click.
 */
export function DashboardAutoRefresh() {
  const router = useRouter()
  const lastRevisionRef = useRef<string | null>(null)
  const refreshingRef = useRef(false)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    if (!supabase) {
      console.warn(
        "[dashboard-realtime] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      )
      return
    }

    let cancelled = false

    function applyRevision(nextRevision: string | null | undefined) {
      if (cancelled || !nextRevision || refreshingRef.current) return

      if (lastRevisionRef.current == null) {
        lastRevisionRef.current = nextRevision
        return
      }

      if (lastRevisionRef.current === nextRevision) return

      lastRevisionRef.current = nextRevision
      refreshingRef.current = true
      window.dispatchEvent(new Event(DASHBOARD_REFRESH_EVENT))
      router.refresh()
      refreshingRef.current = false
    }

    void supabase
      .from("dashboard_data_revisions")
      .select("revision")
      .eq("id", "global")
      .maybeSingle()
      .then(({ data }) => {
        applyRevision(data?.revision ?? null)
      })

    const channel = supabase
      .channel("dashboard-data-revisions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_data_revisions",
          filter: "id=eq.global",
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as { revision?: string } | null
          applyRevision(row?.revision)
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
