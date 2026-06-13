import { NextResponse } from "next/server"

import { fetchPatrolUnitCountsFromPatrollers } from "@/lib/patrollers-counts"

export const dynamic = "force-dynamic"

/** Proxy patrol counts from Patrollers (keeps API key server-side). */
export async function GET() {
  const payload = await fetchPatrolUnitCountsFromPatrollers()
  return NextResponse.json(payload, { status: payload.ok ? 200 : 502 })
}
