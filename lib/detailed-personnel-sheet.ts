import type { DetailedPersonnelTabKey } from "@/lib/detailed-personnel-types"

/** Personnel workbook — Detailed assignment tabs. */
export const DETAILED_PERSONNEL_SHEET = {
  sheetId: "1B0-dkbSxcdmEygDVxz_0tthLz9vFBqax9Fq8WUtoPQk",
  tabs: {
    nhq: { gid: "1613170926", label: "Detailed NHQ" },
    nosus: { gid: "1583302877", label: "Detailed NOSUs" },
    rsu: { gid: "1027634161", label: "Detailed RSU" },
    rhqPpo: { gid: "11295711", label: "Detailed RHQ & PPO" },
  },
} as const satisfies {
  sheetId: string
  tabs: Record<DetailedPersonnelTabKey, { gid: string; label: string }>
}

export function getDetailedPersonnelCsvUrl(tab: DetailedPersonnelTabKey) {
  const sheetId = process.env.GOOGLE_SHEET_ID ?? DETAILED_PERSONNEL_SHEET.sheetId
  const gid = DETAILED_PERSONNEL_SHEET.tabs[tab].gid

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}
