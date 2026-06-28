export function isIndexCrimeCategory(category: string) {
  return category.trim().toUpperCase() === "INDEX"
}

export function isNonIndexCrimeCategory(category: string) {
  const normalized = category.trim().toUpperCase()
  return normalized.length > 0 && normalized !== "INDEX"
}
