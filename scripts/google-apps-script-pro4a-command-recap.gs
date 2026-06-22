/**
 * PRO4A COMMAND — recap tab builder
 *
 * Setup (one time):
 * 1. Open the personnel Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this file, save
 * 4. Run buildPro4aCommandRecap() and approve permissions
 * 5. Optional: add a time-driven trigger to refresh nightly
 */

const RECAP_TAB_NAME = "PRO4A-COMMAND"
const SOURCE_SHEET_NAME = "AlphalistReport_CompleteGenInfo"

const PCO_RANKS = ["PBGEN", "PCOL", "PLTCOL", "PMAJ", "PCPT", "PLT", "PSINSP"]
const PNCO_RANKS = ["Pat", "PCpl", "PSSg", "PMSg", "PSMS", "PCMS", "PEMS"]

const OFFICES = [
  "REGIONAL HEADQUARTERS",
  "CAVITE POLICE PROVINCIAL OFFICE",
  "LAGUNA POLICE PROVINCIAL OFFICE",
  "BATANGAS POLICE PROVINCIAL OFFICE",
  "RIZAL POLICE PROVINCIAL OFFICE",
  "QUEZON POLICE PROVINCIAL OFFICE",
  "REGIONAL MOBILE FORCE BATTALION",
]

function buildPro4aCommandRecap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const source = ss.getSheetByName(SOURCE_SHEET_NAME) || findPersonnelSheet_(ss)
  if (!source) {
    throw new Error("Personnel source sheet not found.")
  }
  const values = source.getDataRange().getValues()
  if (values.length < 2) {
    throw new Error("Source sheet has no personnel rows.")
  }

  const headers = values[0].map(String)
  const index = (name) => headers.indexOf(name)
  const records = []

  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    const record = {
      rank: String(row[index("Rank")] || "").trim(),
      lastName: String(row[index("Last Name")] || "").trim(),
      firstName: String(row[index("First Name")] || "").trim(),
      middleName: String(row[index("Middle Name")] || "").trim(),
      badgeNumber: String(row[index("Badge Number")] || "").trim(),
      birthDate: row[index("BirthDate")] || "",
      lastPromotionDate: row[index("Last Promotion Date")] || "",
      designation: String(row[index("Designation")] || "").trim(),
      pStatus: String(row[index("PStatus")] || "").trim(),
      gender: String(row[index("Gender")] || "").trim(),
      unit: String(row[index("Unit")] || "").trim(),
      subUnit: String(row[index("Sub Unit")] || "").trim(),
      station: String(row[index("Station")] || "").trim(),
    }

    if (record.lastName || record.firstName) {
      records.push(record)
    }
  }

  const recapRows = buildRecapRows_(records)
  let recapSheet = ss.getSheetByName(RECAP_TAB_NAME)
  if (!recapSheet) {
    recapSheet = ss.insertSheet(RECAP_TAB_NAME)
  }

  recapSheet.clearContents()
  recapSheet.getRange(1, 1, recapRows.length, recapRows[0].length).setValues(recapRows)
  recapSheet.setFrozenRows(1)
  recapSheet.autoResizeColumns(1, 5)

  SpreadsheetApp.getUi().alert(
    "PRO4A-COMMAND recap updated with " + records.length + " personnel records.",
  )
}

function findPersonnelSheet_(ss) {
  return ss.getSheets().find((sheet) => {
    const firstCell = String(sheet.getRange(1, 1).getValue() || "").trim()
    return firstCell === "Rank"
  }) || null
}

function buildRecapRows_(records) {
  const rows = [["Section", "Key1", "Key2", "Key3", "Value"]]
  const push = (section, key1, key2, key3, value) => {
    rows.push([section, key1 || "", key2 || "", key3 || "", String(value ?? "")])
  }

  const total = records.length
  const pco = records.filter((r) => PCO_RANKS.indexOf(r.rank) >= 0).length
  const pnco = records.filter((r) => PNCO_RANKS.indexOf(r.rank) >= 0).length
  const nup = records.filter((r) => r.rank.toUpperCase() === "NUP").length
  const uniformed = total - nup

  push("meta", "generated_at", "", "", new Date().toISOString())
  push("meta", "source", "", "", "personnel-roster")
  push("meta", "record_count", "", "", total)
  push("kpi", "total", "", "", total)
  push("workforce", "uniformed", "", "", uniformed)
  push("workforce", "pco", "", "", pco)
  push("workforce", "pnco", "", "", pnco)
  push("workforce", "nup", "", "", nup)

  countBy_(records, "gender").forEach((entry) => {
    push("workforce_gender", entry.name, "", "", entry.count)
  })

  countBy_(records, "pStatus")
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .forEach((entry) => {
      push("status", entry.name, "", "", entry.count)
    })

  PCO_RANKS.forEach((rank) => {
    const count = records.filter((r) => r.rank === rank).length
    if (count > 0) push("rank_pco", rank, "", "", count)
  })

  PNCO_RANKS.forEach((rank) => {
    const count = records.filter((r) => r.rank === rank).length
    if (count > 0) push("rank_pnco", rank, "", "", count)
  })

  OFFICES.forEach((subUnit) => {
    const officeRecords = records.filter((r) => r.subUnit === subUnit)
    push("office", subUnit, "", "", officeRecords.length)
    push(
      "office_active",
      subUnit,
      "",
      "",
      officeRecords.filter((r) => isActiveStatus_(r.pStatus)).length,
    )

    const stations = {}
    officeRecords.forEach((record) => {
      const station = record.station || "Unassigned"
      if (!stations[station]) stations[station] = { pco: 0, pnco: 0, nup: 0 }
      if (PCO_RANKS.indexOf(record.rank) >= 0) stations[station].pco++
      else if (PNCO_RANKS.indexOf(record.rank) >= 0) stations[station].pnco++
      else if (record.rank.toUpperCase() === "NUP") stations[station].nup++
    })

    Object.keys(stations).forEach((station) => {
      const entry = stations[station]
      push("station", subUnit, station, "pco", entry.pco)
      push("station", subUnit, station, "pnco", entry.pnco)
      push("station", subUnit, station, "nup", entry.nup)
    })
  })

  OFFICES.forEach((subUnit) => {
    const officeRecords = records.filter((r) => r.subUnit === subUnit)
    const brackets = { "20-30": 0, "31-39": 0, "40-50": 0, "51-55": 0, "56-above": 0 }
    officeRecords.forEach((record) => {
      const bracket = getAgeBracket_(record.birthDate)
      if (bracket) brackets[bracket]++
    })
    Object.keys(brackets).forEach((bracketId) => {
      push("age", subUnit, bracketId, "", brackets[bracketId])
    })
  })

  PNCO_RANKS.forEach((rank) => {
    const rankRecords = records.filter((r) => r.rank === rank)
    const brackets = {
      "less-than-1": 0,
      "1-5": 0,
      "6-7": 0,
      "8": 0,
      "9": 0,
      "10-above": 0,
    }

    rankRecords.forEach((record) => {
      const bracket = getTenureBracket_(record.lastPromotionDate)
      if (!bracket) return
      brackets[bracket]++
      if (bracket === "8" || bracket === "9" || bracket === "10-above") {
        const person = formatPerson_(record)
        if (person) {
          push("rank_tenure_person", rank, bracket, person.id, person.value)
        }
      }
    })

    Object.keys(brackets).forEach((bracketId) => {
      push("rank_tenure", rank, bracketId, "", brackets[bracketId])
    })
  })

  OFFICES.forEach((subUnit) => {
    const members = records.filter((r) => r.subUnit === subUnit)
    const label = subUnit
    push("unit_count", subUnit, label, "", members.length)
    push(
      "unit_active",
      subUnit,
      "",
      "",
      members.filter((r) => isActiveStatus_(r.pStatus)).length,
    )
  })

  buildLeadershipRows_(records, push)

  return rows
}

function buildLeadershipRows_(records, push) {
  const slots = [
    ["regional_command", "rd", "Regional Director", "REGIONAL HEADQUARTERS", /^regional director/i],
    ["regional_command", "admin", "Dep RD for Admin", "REGIONAL HEADQUARTERS", /dep rd for admin/i],
    ["regional_command", "opns", "Dep RD for Opns", "REGIONAL HEADQUARTERS", /dep rd for opns/i],
    ["regional_command", "staff", "Chief of Regional Staff", "REGIONAL HEADQUARTERS", /chief of regional staff/i],
    ["r_staff", "rprmd", "C, RPRMD", "REGIONAL HEADQUARTERS", /^C,?\s*RPRMD/i],
    ["r_staff", "rid", "C, RID (Acting)", "REGIONAL HEADQUARTERS", /^C,?\s*RID(?:\s|\(|$)/i],
    ["r_staff", "rod", "C, ROD", "REGIONAL HEADQUARTERS", /^C,?\s*ROD/i],
    ["r_staff", "rlrdd", "C, RLRDD", "REGIONAL HEADQUARTERS", /^C,?\s*RLRDD/i],
    ["r_staff", "rcadd", "C, RCADD", "REGIONAL HEADQUARTERS", /^C,?\s*RCADD/i],
    ["r_staff", "rcd", "C, RCD", "REGIONAL HEADQUARTERS", /^C,?\s*RCD(?:\s|\(|$)/i],
    ["r_staff", "ridmd", "C, RIDMD", "REGIONAL HEADQUARTERS", /^C,?\s*RIDMD/i],
    ["r_staff", "retd", "C, RETD", "REGIONAL HEADQUARTERS", /^C,?\s*RETD/i],
    ["r_staff", "rpsmd", "C, RPSMD", "REGIONAL HEADQUARTERS", /^C,?\s*RPSMD/i],
    ["r_staff", "rictmd", "C, RICTMD", "REGIONAL HEADQUARTERS", /^C,?\s*RICTMD/i],
    ["provincial_directors", "cavite-pd", "Provincial Director, Cavite PPO", "CAVITE POLICE PROVINCIAL OFFICE", /provincial director/i],
    ["provincial_directors", "laguna-pd", "Provincial Director, Laguna PPO", "LAGUNA POLICE PROVINCIAL OFFICE", /provincial director/i],
    ["provincial_directors", "batangas-pd", "Provincial Director, Batangas PPO", "BATANGAS POLICE PROVINCIAL OFFICE", /provincial director/i],
    ["provincial_directors", "rizal-pd", "Provincial Director, Rizal PPO", "RIZAL POLICE PROVINCIAL OFFICE", /provincial director/i],
    ["provincial_directors", "quezon-pd", "Provincial Director, Quezon PPO", "QUEZON POLICE PROVINCIAL OFFICE", /provincial director/i],
    ["provincial_directors", "rmfb-fc", "Force Commander, RMFB4A", "REGIONAL MOBILE FORCE BATTALION", /^force commander/i],
  ]

  slots.forEach((slot) => {
    const pool = records.filter((record) => record.subUnit === slot[3])
    const person = pool.find((record) => slot[4].test(String(record.designation || "")))
    if (!person) {
      push("leadership", slot[0], slot[1], slot[2], "|Vacant|1")
      return
    }

    const middle = person.middleName ? " " + person.middleName.charAt(0) + "." : ""
    const name = person.lastName + ", " + person.firstName + middle
    push("leadership", slot[0], slot[1], slot[2], [person.rank, name, "0"].join("|"))
  })
}

function countBy_(records, field) {
  const counts = {}
  records.forEach((record) => {
    const key = String(record[field] || "Unknown").trim() || "Unknown"
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.keys(counts).map((name) => ({ name, count: counts[name] }))
}

function isActiveStatus_(status) {
  const value = String(status || "").toUpperCase()
  return value.includes("ON DUTY") || value === "ACTIVE"
}

function getAgeBracket_(birthDate) {
  const date = parseDate_(birthDate)
  if (!date) return null
  const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  if (age >= 20 && age <= 30) return "20-30"
  if (age >= 31 && age <= 39) return "31-39"
  if (age >= 40 && age <= 50) return "40-50"
  if (age >= 51 && age <= 55) return "51-55"
  if (age >= 56) return "56-above"
  return null
}

function getTenureBracket_(promotionDate) {
  const date = parseDate_(promotionDate)
  if (!date) return promotionDate ? null : "less-than-1"
  const years = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  if (years < 1) return "less-than-1"
  if (years < 6) return "1-5"
  if (years < 8) return "6-7"
  if (years < 9) return "8"
  if (years < 10) return "9"
  return "10-above"
}

function parseDate_(value) {
  // getValues() returns Date objects for date-formatted cells — use directly
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }
  const parts = String(value || "").trim().split("/")
  if (parts.length !== 3) return null
  const month = Number(parts[0]) - 1
  const day = Number(parts[1])
  const year = Number(parts[2])
  const date = new Date(year, month, day)
  return isNaN(date.getTime()) ? null : date
}

function formatDate_(date) {
  if (!date) return ""
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const yyyy = date.getFullYear()
  return mm + "/" + dd + "/" + yyyy
}

function formatPerson_(record) {
  const date = parseDate_(record.lastPromotionDate)
  if (!date) return null
  const middle = record.middleName ? " " + record.middleName.charAt(0) + "." : ""
  const name = record.lastName + ", " + record.firstName + middle
  const years = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  return {
    id: record.badgeNumber || record.lastName + "-" + record.firstName,
    value: [name, record.badgeNumber || "—", formatDate_(date), years, record.unit || "Unassigned", record.subUnit || "Unknown"].join("|"),
  }
}
