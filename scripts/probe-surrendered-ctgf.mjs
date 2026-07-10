import fs from "node:fs"

import { parseSurrenderedCtgfXlsx } from "../lib/surrendered-ctgf-xlsx-parser.ts"

const filePath =
  process.argv[2] ??
  "C:/Users/Project Developer/Documents/COMMAND - UPLOAD FORMAT/R2/SURRENDERED CTGs AND FAs.xlsx"

const buffer = fs.readFileSync(filePath)
const parsed = parseSurrenderedCtgfXlsx(buffer)

console.log(JSON.stringify(parsed, null, 2))
