import { createHash, randomBytes } from "node:crypto"

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
    .select("id, label, key_prefix, role, is_active, created_at, last_used_at, expires_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AccessTokenListItem[]
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
      is_active: true,
    })
    .select("id, label, key_prefix, role, is_active, created_at, last_used_at, expires_at")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return { token, record: data as AccessTokenListItem }
}

export async function revokeAccessToken(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("api_keys").update({ is_active: false }).eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}
