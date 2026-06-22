import fs from "node:fs"

const url =
  "https://docs.google.com/spreadsheets/d/13AzAAC2P1fZRKON5rFtwuySjIvm9JgDS/export?format=csv"
const text = await (await fetch(url)).text()

function parseLine(line) {
  const values = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else {
      current += char
    }
  }

  values.push(current)
  return values.map((value) => value.trim())
}

const lines = text.split(/\r?\n/).filter((line) => line.trim())
const rows = lines.map(parseLine)

let headerIdx = -1
let statusIdx = -1
let activityIdx = -1

for (let i = 0; i < Math.min(rows.length, 15); i++) {
  const row = rows[i].map((cell) => cell.replace(/^\uFEFF/, "").trim())
  const act = row.findIndex((cell) => /ACTIVITY\/TRAINING/i.test(cell))
  const status = row.findIndex((cell) => /^STATUS$/i.test(cell))

  if (act >= 0 && status >= 0) {
    headerIdx = i
    activityIdx = act
    statusIdx = status
    break
  }
}

const MONTHS = new Set([
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
])

function normalizeStatus(value) {
  const status = value.replace(/\s+/g, " ").trim().toUpperCase()
  if (status === "ON GOING" || status === "ON-GOING") return "ONGOING"
  return status
}

const statusCounts = {}
const trainings = []

for (const row of rows.slice(headerIdx + 1)) {
  const activity = (row[activityIdx] ?? "").trim()
  const status = normalizeStatus(row[statusIdx] ?? "")

  if (!activity || !status) continue
  if (MONTHS.has(activity.toUpperCase())) continue
  if (/^TOTAL$/i.test(activity)) continue
  if (!["COMPLETED", "ONGOING", "TO BE OPENED", "CANCELLED", "POSTPONED"].includes(status)) {
    continue
  }

  statusCounts[status] = (statusCounts[status] ?? 0) + 1
  trainings.push({ activity, status })
}

const total = trainings.length

console.log("Header row:", headerIdx + 1)
console.log("Total trainings:", total)
console.log("Completed:", statusCounts.COMPLETED ?? 0)
console.log("Ongoing:", statusCounts.ONGOING ?? 0)
console.log("To be opened:", statusCounts["TO BE OPENED"] ?? 0)
if (statusCounts.CANCELLED) console.log("Cancelled:", statusCounts.CANCELLED)
if (statusCounts.POSTPONED) console.log("Postponed:", statusCounts.POSTPONED)
console.log("Unique titles:", new Set(trainings.map((t) => t.activity)).size)

console.log("\nOngoing list:")
for (const t of trainings.filter((x) => x.status === "ONGOING")) {
  console.log(" -", t.activity)
}

console.log("\nTo be opened (first 10):")
for (const t of trainings.filter((x) => x.status === "TO BE OPENED").slice(0, 10)) {
  console.log(" -", t.activity)
}
