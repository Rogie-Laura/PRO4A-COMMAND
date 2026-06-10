"use server"

import { revalidatePath } from "next/cache"

import {
  createAccessToken,
  listAccessTokens,
  revokeAccessToken,
} from "@/lib/access-tokens"
import { requireSuperAdminSession } from "@/lib/auth/get-session"
import type { AccessKeyRole } from "@/lib/auth/roles"

export async function getAccessTokensAction() {
  await requireSuperAdminSession()
  return listAccessTokens()
}

export async function createAccessTokenAction(
  label: string,
  role: AccessKeyRole,
  officerExpirationDays?: number,
) {
  await requireSuperAdminSession()

  const trimmed = label.trim()

  if (!trimmed) {
    throw new Error("Label is required.")
  }

  if (trimmed.length > 80) {
    throw new Error("Label must be 80 characters or less.")
  }

  const result = await createAccessToken({
    label: trimmed,
    role,
    officerExpirationDays,
  })
  revalidatePath("/settings")
  return result
}

export async function revokeAccessTokenAction(id: string) {
  await requireSuperAdminSession()

  if (!id) {
    throw new Error("Token id is required.")
  }

  await revokeAccessToken(id)
  revalidatePath("/settings")
}
