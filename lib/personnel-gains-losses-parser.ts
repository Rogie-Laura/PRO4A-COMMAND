import type {
  PersonnelGainLossLine,
  PersonnelGainsLosses,
  PersonnelStrengthSnapshot,
  StrengthCounts,
} from "@/lib/personnel-gains-losses-types"

function parseCount(value: unknown): number | null {
  const trimmed = String(value ?? "").trim().replace(/,/g, "")
  if (!trimmed) return null

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function parseStrengthCounts(row: unknown[]): StrengthCounts | null {
  const pco = parseCount(row[2])
  const pnco = parseCount(row[4])
  const nup = parseCount(row[6])
  const total = parseCount(row[8])

  if (pco === null && pnco === null && nup === null && total === null) {
    return null
  }

  return {
    pco: pco ?? 0,
    pnco: pnco ?? 0,
    nup: nup ?? 0,
    total: total ?? 0,
  }
}

function cell(row: unknown[], index: number) {
  return String(row[index] ?? "").trim()
}

function isPart2Start(row: unknown[]) {
  const label = cell(row, 0).toLowerCase()
  return label === "unit" || label === "sub-total" || label === "grand total"
}

function isGainTotalRow(row: unknown[]) {
  return cell(row, 1).toLowerCase() === "total:"
}

function parseSnapshot(row: unknown[]): PersonnelStrengthSnapshot | null {
  const asOf = cell(row, 0)
  if (!/^as of/i.test(asOf)) return null

  const counts = parseStrengthCounts(row)
  if (!counts) return null

  return { asOf, counts }
}

function parseMovementLine(row: unknown[], kind: "gain" | "loss"): PersonnelGainLossLine | null {
  const prefix = kind === "gain" ? "add:" : "less:"
  const label = cell(row, 0).toLowerCase()
  if (!label.startsWith(prefix)) return null
  if (isGainTotalRow(row)) return null

  const category = cell(row, 1) || (kind === "gain" ? "Unspecified gain" : "Unspecified loss")
  const counts = parseStrengthCounts(row) ?? { pco: 0, pnco: 0, nup: 0, total: 0 }

  return { category, counts }
}

export function parsePersonnelGainsLossesRows(rows: unknown[][]): PersonnelGainsLosses {
  const empty: PersonnelGainsLosses = {
    dataReady: false,
    title: "ACTUAL STRENGTH OF PRO CALABARZON",
    opening: null,
    gains: [],
    losses: [],
    closing: null,
  }

  if (rows.length === 0) return empty

  const title = cell(rows[0] ?? [], 0) || empty.title
  let opening: PersonnelStrengthSnapshot | null = null
  let closing: PersonnelStrengthSnapshot | null = null
  const gains: PersonnelGainLossLine[] = []
  const losses: PersonnelGainLossLine[] = []
  let seenLosses = false

  for (const row of rows) {
    if (!Array.isArray(row) || isPart2Start(row)) break

    const snapshot = parseSnapshot(row)
    if (snapshot) {
      if (!opening) {
        opening = snapshot
        continue
      }

      if (seenLosses || losses.length > 0) {
        closing = snapshot
        break
      }
    }

    const gain = parseMovementLine(row, "gain")
    if (gain) {
      gains.push(gain)
      continue
    }

    const loss = parseMovementLine(row, "loss")
    if (loss) {
      seenLosses = true
      losses.push(loss)
    }
  }

  const dataReady = Boolean(opening && closing)

  return {
    dataReady,
    title,
    opening,
    gains,
    losses,
    closing,
  }
}
