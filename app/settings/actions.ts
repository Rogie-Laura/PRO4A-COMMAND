"use server"

import { revalidatePath } from "next/cache"

import {
  createAccessToken,
  listAccessTokens,
  revokeAccessToken,
} from "@/lib/access-tokens"

export async function getAccessTokensAction() {
  return listAccessTokens()
}

export async function createAccessTokenAction(label: string) {
  const trimmed = label.trim()

  if (!trimmed) {
    throw new Error("Label is required.")
  }

  if (trimmed.length > 80) {
    throw new Error("Label must be 80 characters or less.")
  }

  const result = await createAccessToken(trimmed)
  revalidatePath("/settings")
  return result
}

export async function revokeAccessTokenAction(id: string) {
  if (!id) {
    throw new Error("Token id is required.")
  }

  await revokeAccessToken(id)
  revalidatePath("/settings")
}
