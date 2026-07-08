import { hashAccessToken } from "@/lib/access-tokens"
import { normalizeAccessKeyInput } from "@/lib/auth/parse-access-key"
import type { AccessKeyRole } from "@/lib/auth/roles"
import { isDivisionId, type DivisionId } from "@/lib/division-scope"
import { createAdminClient } from "@/lib/supabase/admin"

export type ValidatedAccessKey = {
  id: string
  label: string
  role: AccessKeyRole
  expires_at: string | null
  division_scope: DivisionId | null
}

function parseStoredRole(value: string | null | undefined): AccessKeyRole {
  if (value === "officer") return "officer"
  if (value === "division_uploader") return "division_uploader"
  return "super_admin"
}

export async function validateAccessKey(accessKey: string): Promise<ValidatedAccessKey> {
  const normalized = normalizeAccessKeyInput(accessKey)
  const key_hash = hashAccessToken(normalized)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("api_keys")
    .select("id, label, role, is_active, expires_at, division_scope")
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

  const role = parseStoredRole(data.role)

  if (role === "division_uploader" && !isDivisionId(data.division_scope)) {
    throw new Error("Division focal token is missing a valid division scope.")
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)

  return {
    id: data.id,
    label: data.label,
    role,
    expires_at: data.expires_at,
    division_scope: isDivisionId(data.division_scope) ? data.division_scope : null,
  }
}
