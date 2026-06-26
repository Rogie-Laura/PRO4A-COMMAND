import {
  EMPTY_PATROL_COUNTS,
  type PatrolUnitCounts,
  type PatrolUnitTypeId,
} from "@/lib/patrol-intervention-config"

export type PatrolUnitBreakdownRow = {
  unit: string
  counts: PatrolUnitCounts
  duty_counts: PatrolUnitCounts
}

export type PatrolOfficeBreakdownRow = {
  office: string
  counts: PatrolUnitCounts
  duty_counts: PatrolUnitCounts
  units: PatrolUnitBreakdownRow[]
}

export type PatrolCountsPayload = {
  ok: boolean
  counts: PatrolUnitCounts
  duty_counts: PatrolUnitCounts
  total: number
  duty_total: number
  office_breakdown: PatrolOfficeBreakdownRow[]
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

function normalizeUnitBreakdown(raw: unknown): PatrolUnitBreakdownRow[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null
      const row = entry as {
        unit?: string
        counts?: Record<string, number>
        duty_counts?: Record<string, number>
      }
      const unit = String(row.unit ?? "").trim()
      if (!unit) return null

      return {
        unit,
        counts: normalizeCounts(row.counts),
        duty_counts: normalizeCounts(row.duty_counts),
      }
    })
    .filter((row): row is PatrolUnitBreakdownRow => row !== null)
}

function normalizeOfficeBreakdown(raw: unknown): PatrolOfficeBreakdownRow[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null
      const row = entry as {
        office?: string
        counts?: Record<string, number>
        duty_counts?: Record<string, number>
        units?: unknown
      }
      const office = String(row.office ?? "").trim()
      if (!office) return null

      return {
        office,
        counts: normalizeCounts(row.counts),
        duty_counts: normalizeCounts(row.duty_counts),
        units: normalizeUnitBreakdown(row.units),
      }
    })
    .filter((row): row is PatrolOfficeBreakdownRow => row !== null)
}

export async function fetchPatrolUnitCountsFromPatrollers(): Promise<PatrolCountsPayload> {
  const baseUrl = process.env.PATROLLERS_API_URL?.trim().replace(/\/$/, "")
  const apiKey = process.env.PATROLLERS_COUNTS_API_KEY?.trim()

  if (!baseUrl) {
    return {
      ok: false,
      counts: EMPTY_PATROL_COUNTS,
      duty_counts: EMPTY_PATROL_COUNTS,
      total: 0,
      duty_total: 0,
      office_breakdown: [],
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
      duty_counts?: Record<string, number>
      office_breakdown?: unknown
      total?: number
      duty_total?: number
      updated_at?: string
      error?: string
    }

    if (!response.ok) {
      return {
        ok: false,
        counts: EMPTY_PATROL_COUNTS,
        duty_counts: EMPTY_PATROL_COUNTS,
        total: 0,
        duty_total: 0,
        office_breakdown: [],
        updated_at: null,
        error: data.error ?? `Patrollers API returned ${response.status}.`,
      }
    }

    const counts = normalizeCounts(data.counts)
    const duty_counts = normalizeCounts(data.duty_counts)
    const office_breakdown = normalizeOfficeBreakdown(data.office_breakdown)
    const total =
      typeof data.total === "number"
        ? data.total
        : Object.values(counts).reduce((sum, n) => sum + n, 0)
    const duty_total =
      typeof data.duty_total === "number"
        ? data.duty_total
        : Object.values(duty_counts).reduce((sum, n) => sum + n, 0)

    return {
      ok: true,
      counts,
      duty_counts,
      total,
      duty_total,
      office_breakdown,
      updated_at: data.updated_at ?? new Date().toISOString(),
    }
  } catch (err) {
    return {
      ok: false,
      counts: EMPTY_PATROL_COUNTS,
      duty_counts: EMPTY_PATROL_COUNTS,
      total: 0,
      duty_total: 0,
      office_breakdown: [],
      updated_at: null,
      error:
        err instanceof Error
          ? err.message
          : "Could not reach the Patrollers monitoring API.",
    }
  }
}
