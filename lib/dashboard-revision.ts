import { createAdminClient } from "@/lib/supabase/admin"

const GLOBAL_REVISION_ID = "global"

/** Bumps the shared dashboard revision so open viewers can auto-refresh. */
export async function bumpDashboardRevision(source: string): Promise<void> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()
    const { error } = await supabase.from("dashboard_data_revisions").upsert(
      {
        id: GLOBAL_REVISION_ID,
        revision: now,
        source: source.slice(0, 120),
        updated_at: now,
      },
      { onConflict: "id" },
    )

    if (error) {
      console.error("[dashboard-revision] bump failed:", error.message)
    }
  } catch (error) {
    console.error(
      "[dashboard-revision] bump failed:",
      error instanceof Error ? error.message : error,
    )
  }
}

/** Latest revision stamp for open-dashboard polling. */
export async function getDashboardRevision(): Promise<string> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("dashboard_data_revisions")
      .select("revision")
      .eq("id", GLOBAL_REVISION_ID)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data?.revision ?? "0"
  } catch {
    return "0"
  }
}
