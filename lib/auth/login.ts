import { hashAccessToken } from "@/lib/access-tokens"
import { normalizeAccessKeyInput } from "@/lib/auth/parse-access-key"
import type { AccessKeyRole } from "@/lib/auth/roles"
import { createAdminClient } from "@/lib/supabase/admin"

export type ValidatedAccessKey = {
  id: string
  label: string
  role: AccessKeyRole
  expires_at: string | null
}

export async function validateAccessKey(accessKey: string): Promise<ValidatedAccessKey> {
  const normalized = normalizeAccessKeyInput(accessKey)
  const key_hash = hashAccessToken(normalized)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, label, role, is_active, expires_at")
    .eq("key_hash", key_hash)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    throw new Error("Unable to verify access key. Please contact super admin.")
  }

  if (!data) {
    throw new Error("Access key is invalid or has been revoked.")
  }

  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
    throw new Error("Access key has expired. Request a new key from super admin.")
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)

  return {
    id: data.id,
    label: data.label,
    role: data.role === "officer" ? "officer" : "super_admin",
    expires_at: data.expires_at,
  }
}
