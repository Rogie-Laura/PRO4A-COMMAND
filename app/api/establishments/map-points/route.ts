import { NextResponse } from "next/server"

import { fetchLatestEstablishmentMapPoints } from "@/lib/establishment-map-points"
import {
  isPatrollersApiKeyConfigured,
  verifyPatrollersApiKey,
} from "@/lib/patrollers-api-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Latest PRO4A COMMAND establishment coordinates for Patrollers map overlay. */
export async function GET(request: Request) {
  if (!isPatrollersApiKeyConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Establishments API is not configured. Set PATROLLERS_COUNTS_API_KEY.",
      },
      { status: 503 },
    )
  }

  if (!verifyPatrollersApiKey(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
  }

  try {
    const { batch, establishments } = await fetchLatestEstablishmentMapPoints()

    return NextResponse.json({
      ok: true,
      count: establishments.length,
      batch,
      establishments,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to load establishments.",
      },
      { status: 500 },
    )
  }
}
