export function verifyPatrollersApiKey(request: Request) {
  const expected = process.env.PATROLLERS_COUNTS_API_KEY?.trim()
  if (!expected) return false

  const header =
    request.headers.get("x-patrollers-api-key")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim()

  return header === expected
}

export function isPatrollersApiKeyConfigured() {
  return Boolean(process.env.PATROLLERS_COUNTS_API_KEY?.trim())
}
