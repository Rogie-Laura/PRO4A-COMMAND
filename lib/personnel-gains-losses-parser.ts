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

function emptyCounts(): StrengthCounts {
  return { pco: 0, pnco: 0, nup: 0, total: 0 }
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

function detectCountColumns(rows: unknown[][]) {
  for (const row of rows.slice(0, 8)) {
    if (!Array.isArray(row)) continue

    const normalized = row.map((value) =>
      String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ""),
    )

    const pco = normalized.findIndex((value) => value === "pcos" || value === "pco")
    const pnco = normalized.findIndex((value) => value === "pncos" || value === "pnco")
    const nup = normalized.findIndex((value) => value === "nup")
    const total = normalized.findIndex((value) => value === "total")

    if (pco >= 0 && pnco >= 0 && nup >= 0 && total >= 0) {
      return { pco, pnco, nup, total }
    }
  }

  return { pco: 2, pnco: 4, nup: 6, total: 8 }
}

function parseStrengthCounts(
  row: unknown[],
  columns: { pco: number; pnco: number; nup: number; total: number },
): StrengthCounts | null {
  const pco = parseCount(row[columns.pco])
  const pnco = parseCount(row[columns.pnco])
  const nup = parseCount(row[columns.nup])
  const total = parseCount(row[columns.total])

  if (pco === null && pnco === null && nup === null && total === null) {
    return null
  }

  return {
    pco: pco ?? 0,
    pnco: pnco ?? 0,
    nup: nup ?? 0,
    total: total ?? (pco ?? 0) + (pnco ?? 0) + (nup ?? 0),
  }
}

function parseSnapshot(
  row: unknown[],
  columns: { pco: number; pnco: number; nup: number; total: number },
): PersonnelStrengthSnapshot | null {
  const asOf = cell(row, 0)
  if (!/^as of/i.test(asOf)) return null

  const counts = parseStrengthCounts(row, columns)
  if (!counts) return null

  return { asOf, counts }
}

function splitMovementLabel(raw: string, kind: "gain" | "loss") {
  const prefix = kind === "gain" ? "add:" : "less:"
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()

  if (!lower.startsWith(prefix)) return null

  const remainder = trimmed.slice(prefix.length).trim()
  return remainder || null
}

function hasAnyCount(counts: StrengthCounts) {
  return counts.pco > 0 || counts.pnco > 0 || counts.nup > 0 || counts.total > 0
}

function parseMovementLine(
  row: unknown[],
  kind: "gain" | "loss",
  columns: { pco: number; pnco: number; nup: number; total: number },
): PersonnelGainLossLine | null {
  if (isGainTotalRow(row)) return null

  const prefix = kind === "gain" ? "add:" : "less:"
  const first = cell(row, 0)
  const second = cell(row, 1)
  const combined = first.toLowerCase().startsWith(prefix)
    ? first
    : second.toLowerCase().startsWith(prefix)
      ? second
      : ""

  if (!combined) return null

  const inlineCategory = splitMovementLabel(combined, kind)
  const category =
    inlineCategory ||
    (first.toLowerCase().startsWith(prefix) ? second : "") ||
    (kind === "gain" ? "Unspecified gain" : "Unspecified loss")

  const counts = parseStrengthCounts(row, columns) ?? emptyCounts()

  // Skip blank placeholder rows (e.g. "add: Negative" with all zeros).
  if (!hasAnyCount(counts)) return null

  return { category, counts }
}

export function sumStrengthCounts(lines: PersonnelGainLossLine[]): StrengthCounts {
  return lines.reduce(
    (acc, line) => ({
      pco: acc.pco + line.counts.pco,
      pnco: acc.pnco + line.counts.pnco,
      nup: acc.nup + line.counts.nup,
      total: acc.total + line.counts.total,
    }),
    emptyCounts(),
  )
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

  const columns = detectCountColumns(rows)
  const title = cell(rows[0] ?? [], 0) || empty.title
  let opening: PersonnelStrengthSnapshot | null = null
  let closing: PersonnelStrengthSnapshot | null = null
  const gains: PersonnelGainLossLine[] = []
  const losses: PersonnelGainLossLine[] = []

  for (const row of rows) {
    if (!Array.isArray(row) || isPart2Start(row)) break

    const snapshot = parseSnapshot(row, columns)
    if (snapshot) {
      if (!opening) {
        opening = snapshot
        continue
      }

      // Second dated strength row with counts = closing (after movements).
      closing = snapshot
      break
    }

    const gain = parseMovementLine(row, "gain", columns)
    if (gain) {
      gains.push(gain)
      continue
    }

    const loss = parseMovementLine(row, "loss", columns)
    if (loss) {
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
