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
let classIdx = -1

for (let i = 0; i < Math.min(rows.length, 15); i++) {
  const row = rows[i].map((cell) => cell.replace(/^\uFEFF/, "").trim())
  const act = row.findIndex((cell) => /ACTIVITY\/TRAINING/i.test(cell))
  const status = row.findIndex((cell) => /^STATUS$/i.test(cell))

  if (act >= 0 && status >= 0) {
    headerIdx = i
    activityIdx = act
    statusIdx = status
    classIdx = row.findIndex((cell) => /No\.?\s*of\s*Class/i.test(cell))
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
const statusClasses = {}
const trainings = []

for (const row of rows.slice(headerIdx + 1)) {
  const activity = (row[activityIdx] ?? "").trim()
  const status = normalizeStatus(row[statusIdx] ?? "")
  const classes = Number.parseInt((row[classIdx] ?? "").replace(/[^\d]/g, ""), 10) || 0

  if (!activity || !status) continue
  if (MONTHS.has(activity.toUpperCase())) continue
  if (/^TOTAL$/i.test(activity)) continue
  if (!["COMPLETED", "ONGOING", "TO BE OPENED", "CANCELLED", "POSTPONED"].includes(status)) {
    continue
  }

  statusCounts[status] = (statusCounts[status] ?? 0) + 1
  statusClasses[status] = (statusClasses[status] ?? 0) + classes
  trainings.push({ activity, status, classes })
}

let plannedTotal = 0
for (const row of rows.slice(headerIdx + 1)) {
  const activity = (row[activityIdx] ?? "").trim()
  if (!/^TOTAL$/i.test(activity)) continue
  plannedTotal += Number.parseInt((row[classIdx] ?? "").replace(/[^\d]/g, ""), 10) || 0
}

const totalClasses = Object.values(statusClasses).reduce((sum, n) => sum + n, 0)

console.log("Header row:", headerIdx + 1)
console.log("Planned total classes (TOTAL rows):", plannedTotal)
console.log("Training rows:", trainings.length)
console.log("Classes by status:", statusClasses)
console.log("Sum classified classes:", totalClasses)
console.log("Completed classes:", statusClasses.COMPLETED ?? 0)
console.log("Ongoing classes:", statusClasses.ONGOING ?? 0)
console.log("To be opened classes:", statusClasses["TO BE OPENED"] ?? 0)

console.log("\nOngoing list:")
for (const t of trainings.filter((x) => x.status === "ONGOING")) {
  console.log(" -", t.activity)
}

console.log("\nTo be opened (first 10):")
for (const t of trainings.filter((x) => x.status === "TO BE OPENED").slice(0, 10)) {
  console.log(" -", t.activity)
}
