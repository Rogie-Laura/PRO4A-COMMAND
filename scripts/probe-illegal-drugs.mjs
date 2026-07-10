import fs from "node:fs"

import { parseIllegalDrugsXlsx } from "../lib/illegal-drugs-xlsx-parser.ts"

const filePath =
  process.argv[2] ??
  "C:/Users/Project Developer/Documents/COMMAND - UPLOAD FORMAT/R2/ILLEGAL DRUGS.xlsx"

const buffer = fs.readFileSync(filePath)
const parsed = parseIllegalDrugsXlsx(buffer)

console.log(JSON.stringify(parsed, null, 2))
