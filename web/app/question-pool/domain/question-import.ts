import type { CsvRow } from "./csv"

export const toImportQuestionPayload = (row: CsvRow) => {
  const identifier = row.identifier?.trim()
  const text = row.text?.trim()

  if (!identifier || !text) return null

  return {
    ...row,
    identifier,
    text,
  }
}
