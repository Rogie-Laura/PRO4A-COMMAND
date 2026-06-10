export function normalizeAccessKeyInput(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error("Ilagay ang access key o i-scan ang QR.")
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed)
      const fromQuery = url.searchParams.get("key") ?? url.searchParams.get("t")

      if (fromQuery?.startsWith("pk_")) {
        return fromQuery.trim()
      }
    }
  } catch {
    // Fall through to plain token parsing.
  }

  if (trimmed.startsWith("pk_")) {
    return trimmed
  }

  throw new Error("Hindi valid ang access key. Dapat nagsisimula sa pk_.")
}
