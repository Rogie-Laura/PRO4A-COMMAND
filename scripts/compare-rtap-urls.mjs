const sheetId = "13AzAAC2P1fZRKON5rFtwuySjIvm9JgDS"

const urls = {
  export: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
  gviz: `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
}

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
      } else inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
    } else current += char
  }
  values.push(current)
  return values.map((v) => v.trim())
}

for (const [name, url] of Object.entries(urls)) {
  const res = await fetch(url)
  const text = await res.text()
  const rows = text.split(/\r?\n/).filter((l) => l.trim()).map(parseLine)
  console.log(`\n=== ${name} ===`)
  console.log("status:", res.status, "bytes:", text.length, "rows:", rows.length)
  for (let i = 0; i < Math.min(8, rows.length); i++) {
    console.log(`row ${i}:`, rows[i].slice(0, 8).join(" | "))
  }
}
