import { normalizeHeaderToken } from "./headers"

export type CsvRow = Record<string, string>

const HEADER_ALIAS_BY_TOKEN: Record<string, string> = {
  id: "identifier",
  identifier: "identifier",
  questionid: "identifier",
  text: "text",
  question: "text",
  questiontext: "text",
  domain: "domain",
  risktype: "riskType",
  isoreference: "isoReference",
}

export const parseCsvLine = (line: string) => {
  const cells: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\""
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  cells.push(current.trim())
  return cells
}

export const parseCsvQuestions = (text: string): CsvRow[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) return []

  const rawHeaders = parseCsvLine(lines[0]).map((header) => header.replace(/^\"|\"$/g, "").trim())

  const usedHeaderKeys = new Set<string>()
  const headerKeys = rawHeaders.map((header, index) => {
    const normalized = normalizeHeaderToken(header)
    const baseKey = HEADER_ALIAS_BY_TOKEN[normalized] ?? header
    const fallbackKey = baseKey || `column${index + 1}`
    let key = fallbackKey
    let suffix = 2

    while (usedHeaderKeys.has(key)) {
      key = `${fallbackKey}_${suffix}`
      suffix += 1
    }

    usedHeaderKeys.add(key)
    return key
  })

  if (!headerKeys.includes("identifier") || !headerKeys.includes("text")) {
    throw new Error("CSV must include headers for identifier and text.")
  }

  return lines
    .slice(1)
    .map((line) => {
      const cells = parseCsvLine(line).map((cell) => cell.replace(/^\"|\"$/g, "").trim())
      const row: CsvRow = {}

      headerKeys.forEach((key, index) => {
        row[key] = cells[index] ?? ""
      })

      return row
    })
    .filter((row) => Object.values(row).some((value) => value !== ""))
}
