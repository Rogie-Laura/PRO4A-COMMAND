import { createHash, randomBytes } from "node:crypto"

import { encryptAccessToken, decryptAccessToken } from "@/lib/access-token-crypto"
import { buildLoginUrl } from "@/lib/auth/login-url"
import {
  computeOfficerExpiresAt,
  type AccessKeyRole,
} from "@/lib/auth/roles"
import { createAdminClient } from "@/lib/supabase/admin"

export type AccessTokenListItem = {
  id: string
  label: string
  key_prefix: string
  role: AccessKeyRole
  is_active: boolean
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  has_qr: boolean
}

const TOKEN_PREFIX = "pk_"

export function generateAccessToken() {
  const token = `${TOKEN_PREFIX}${randomBytes(24).toString("hex")}`
  const key_prefix = token.slice(0, 10)
  const key_hash = hashAccessToken(token)

  return { token, key_prefix, key_hash }
}

export function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function listAccessTokens(): Promise<AccessTokenListItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("api_keys")
    .select(
      "id, label, key_prefix, role, is_active, created_at, last_used_at, expires_at, encrypted_key",
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    key_prefix: row.key_prefix,
    role: row.role === "officer" ? "officer" : "super_admin",
    is_active: row.is_active,
    created_at: row.created_at,
    last_used_at: row.last_used_at,
    expires_at: row.expires_at,
    has_qr: Boolean(row.encrypted_key),
  }))
}

type CreateAccessTokenInput = {
  label: string
  role: AccessKeyRole
  officerExpirationDays?: number
}

export async function createAccessToken({
  label,
  role,
  officerExpirationDays,
}: CreateAccessTokenInput) {
  const supabase = createAdminClient()
  const { token, key_prefix, key_hash } = generateAccessToken()
  const encrypted_key = encryptAccessToken(token)

  let expires_at: string | null = null

  if (role === "officer") {
    if (!officerExpirationDays || officerExpirationDays <= 0) {
      throw new Error("Officer key expiration is required.")
    }

    expires_at = computeOfficerExpiresAt(officerExpirationDays)
  }

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      label,
      key_prefix,
      key_hash,
      role,
      expires_at,
      encrypted_key,
      is_active: true,
    })
    .select("id, label, key_prefix, role, is_active, created_at, last_used_at, expires_at, encrypted_key")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    token,
    record: {
      id: data.id,
      label: data.label,
      key_prefix: data.key_prefix,
      role: data.role === "officer" ? "officer" : "super_admin",
      is_active: data.is_active,
      created_at: data.created_at,
      last_used_at: data.last_used_at,
      expires_at: data.expires_at,
      has_qr: Boolean(data.encrypted_key),
    } satisfies AccessTokenListItem,
  }
}

export async function getAccessTokenLoginUrl(id: string, origin: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("api_keys")
    .select("encrypted_key, is_active, label")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Access token not found.")
  }

  if (!data.is_active) {
    throw new Error("Revoked access tokens cannot show a login QR.")
  }

  if (!data.encrypted_key) {
    throw new Error("QR is only available for keys created after QR storage was enabled.")
  }

  const token = decryptAccessToken(data.encrypted_key)

  return {
    label: data.label,
    loginUrl: buildLoginUrl(token, origin),
  }
}

export async function revokeAccessToken(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}
