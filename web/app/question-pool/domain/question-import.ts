import type { JsonRow } from "./json"

export const toImportQuestionPayload = (row: JsonRow) => {
  const identifier = typeof row.identifier === "string" ? row.identifier.trim() : ""
  const text = typeof row.text === "string" ? row.text.trim() : ""

  if (!identifier || !text) return null

  return { ...row, identifier, text }
}
