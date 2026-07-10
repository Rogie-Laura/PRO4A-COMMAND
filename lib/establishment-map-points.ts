import { createAdminClient } from "@/lib/supabase/admin"

const PAGE_SIZE = 1000

export type EstablishmentMapPoint = {
  id: number
  latitude: number
  longitude: number
  establishmentType: string
  name: string
  location: string
  ppo: string
  station: string
  province: string
}

function mapEstablishmentRow(row: {
  id: number
  latitude: number | string
  longitude: number | string
  establishment_type: string
  name: string
  location: string
  ppo: string
  station: string
  province: string
}): EstablishmentMapPoint {
  return {
    id: row.id,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    establishmentType: row.establishment_type,
    name: row.name,
    location: row.location,
    ppo: row.ppo,
    station: row.station,
    province: row.province,
  }
}

export async function fetchLatestEstablishmentMapPoints() {
  const supabase = createAdminClient()

  const { data: batch, error: batchError } = await supabase
    .from("establishment_upload_batches")
    .select("id, filename, created_at, record_count")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (batchError) {
    throw new Error(batchError.message)
  }

  if (!batch) {
    return {
      batch: null,
      establishments: [] as EstablishmentMapPoint[],
    }
  }

  const establishments: EstablishmentMapPoint[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("establishments")
      .select(
        "id, latitude, longitude, establishment_type, name, location, ppo, station, province",
      )
      .eq("batch_id", batch.id)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data?.length) break

    establishments.push(...data.map(mapEstablishmentRow))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return {
    batch: {
      id: batch.id,
      filename: batch.filename,
      createdAt: batch.created_at,
      recordCount: batch.record_count ?? establishments.length,
    },
    establishments,
  }
}
