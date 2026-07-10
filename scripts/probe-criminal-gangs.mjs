import fs from "node:fs"

import { parseCriminalGangsXlsx } from "../lib/criminal-gangs-xlsx-parser.ts"

const filePath =
  process.argv[2] ??
  "C:/Users/Project Developer/Documents/COMMAND - UPLOAD FORMAT/R2/ACCOMPLISHMENTS ON CRIMINAL GANGS.xlsx"

const buffer = fs.readFileSync(filePath)
const parsed = parseCriminalGangsXlsx(buffer)

console.log(JSON.stringify(parsed, null, 2))
