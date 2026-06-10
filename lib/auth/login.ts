import { hashAccessToken } from "@/lib/access-tokens"
import { normalizeAccessKeyInput } from "@/lib/auth/parse-access-key"
import { createAdminClient } from "@/lib/supabase/admin"

export type ValidatedAccessKey = {
  id: string
  label: string
}

export async function validateAccessKey(accessKey: string): Promise<ValidatedAccessKey> {
  const normalized = normalizeAccessKeyInput(accessKey)
  const key_hash = hashAccessToken(normalized)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, label, is_active")
    .eq("key_hash", key_hash)
    .eq("is_active", true)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Access key hindi valid o revoked na. Paki-check sa admin.")
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)

  return {
    id: data.id,
    label: data.label,
  }
}
