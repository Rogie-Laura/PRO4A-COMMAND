import {
  EMPTY_PATROL_COUNTS,
  type PatrolUnitCounts,
  type PatrolUnitTypeId,
} from "@/lib/patrol-intervention-config"

export type PatrolCountsPayload = {
  ok: boolean
  counts: PatrolUnitCounts
  total: number
  updated_at: string | null
  error?: string
}

function normalizeCounts(raw: Record<string, number> | undefined): PatrolUnitCounts {
  const counts = { ...EMPTY_PATROL_COUNTS }
  if (!raw) return counts

  for (const key of Object.keys(EMPTY_PATROL_COUNTS) as PatrolUnitTypeId[]) {
    const value = raw[key]
    counts[key] = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
  }

  return counts
}

export async function fetchPatrolUnitCountsFromPatrollers(): Promise<PatrolCountsPayload> {
  const baseUrl = process.env.PATROLLERS_API_URL?.trim().replace(/\/$/, "")
  const apiKey = process.env.PATROLLERS_COUNTS_API_KEY?.trim()

  if (!baseUrl) {
    return {
      ok: false,
      counts: EMPTY_PATROL_COUNTS,
      total: 0,
      updated_at: null,
      error:
        "Patrollers API URL is not configured. Set PATROLLERS_API_URL on PRO4A-COMMAND.",
    }
  }

  try {
    const headers: HeadersInit = { Accept: "application/json" }
    if (apiKey) {
      headers["X-Patrollers-Api-Key"] = apiKey
    }

    const response = await fetch(`${baseUrl}/api/monitor/patrol-unit-counts`, {
      headers,
      cache: "no-store",
    })

    const data = (await response.json()) as {
      ok?: boolean
      counts?: Record<string, number>
      total?: number
      updated_at?: string
      error?: string
    }

    if (!response.ok) {
      return {
        ok: false,
        counts: EMPTY_PATROL_COUNTS,
        total: 0,
        updated_at: null,
        error: data.error ?? `Patrollers API returned ${response.status}.`,
      }
    }

    const counts = normalizeCounts(data.counts)
    const total =
      typeof data.total === "number"
        ? data.total
        : Object.values(counts).reduce((sum, n) => sum + n, 0)

    return {
      ok: true,
      counts,
      total,
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  } catch (err) {
    return {
      ok: false,
      counts: EMPTY_PATROL_COUNTS,
      total: 0,
      updated_at: null,
      error:
        err instanceof Error
          ? err.message
          : "Could not reach the Patrollers monitoring API.",
    }
  }
}
