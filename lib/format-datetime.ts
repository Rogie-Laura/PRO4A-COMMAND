export function formatPhilippinesDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

/** e.g. "Uploaded July 14, 2026 at 10:18 PM" */
export function formatPhilippinesUploadedAt(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const datePart = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)

  const timePart = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)

  return `Uploaded ${datePart} at ${timePart}`
}
