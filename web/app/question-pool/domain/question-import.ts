import type { CsvRow } from "./csv"

/**
 * CSV cells are always strings. Fields whose value looks like a JSON array or
 * object are parsed so they are stored with the correct type in the database
 * (e.g. the `columns` field on table-type questions).
 */
const parseJsonFields = (row: CsvRow): Record<string, unknown> => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "string" && (value.startsWith("[") || value.startsWith("{"))) {
      try {
        result[key] = JSON.parse(value)
        continue
      } catch {
        // not valid JSON — keep as string
      }
    }
    result[key] = value
  }
  return result
}

export const toImportQuestionPayload = (row: CsvRow) => {
  const identifier = row.identifier?.trim()
  const text = row.text?.trim()

  if (!identifier || !text) return null

  return {
    ...parseJsonFields(row),
    identifier,
    text,
  }
}
